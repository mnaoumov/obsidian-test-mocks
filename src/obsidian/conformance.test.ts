/**
 * @file
 *
 * Conformance test enforcing L1 + L4 automatically:
 *
 * - Forward: every public member declared in `obsidian.d.ts` (classes and their
 *   instance/static members, plus the top-level value exports) must have an
 *   equivalent member in the mocks.
 * - Reverse: any extra public mock member that is NOT in `obsidian.d.ts` must either end
 *   with the `__` mock-only suffix, or name a real Obsidian internal that `obsidian-typings`
 *   declares. The second allowance is what lets a mock implement `Menu.items` under its real
 *   name instead of `items__` plus a bridge: such a member is not a fake one, so the marker
 *   that means "this does not exist in Obsidian" would be a lie.
 * - Kind: a global-augmentation member declared as a value property (`doc: Document`)
 *   must not be implemented as a method — a mock exposing it as a function compiles
 *   against the real typings in consumers but blows up at runtime.
 *
 * This is a type-conformance meta-test: it deliberately reads the real
 * `obsidian.d.ts` via the TypeScript compiler API (not a behavioral unit test),
 * so it is the one place that legitimately reaches the installed obsidian types.
 *
 * Interfaces and type aliases from `obsidian.d.ts` are out of scope — this
 * package mocks runtime entities (classes, functions, vars) only.
 */

import type {
  SourceFile,
  Symbol as TsSymbol,
  Type,
  TypeChecker
} from 'typescript';

import { join } from 'node:path';
import process from 'node:process';
import {
  createProgram,
  getCombinedModifierFlags,
  isFunctionTypeNode,
  isInterfaceDeclaration,
  isModuleDeclaration,
  isPropertySignature,
  ModifierFlags,
  NodeFlags,
  parseJsonConfigFileContent,
  readConfigFile,
  resolveModuleName,
  SymbolFlags,
  sys
} from 'typescript';
import {
  describe,
  expect,
  it
} from 'vitest';

import { getAllAugmentedMemberNames } from '../../scripts/helpers/obsidian-typings-surface.ts';

/**
 * Maps each global interface that `obsidian.d.ts` augments to the runtime object
 * carrying its members. Augmentations of obsidian's own config-shape interfaces
 * (`DomElementInfo`, `AjaxOptions`, …) are type-only and have no runtime target,
 * so they are intentionally absent.
 */
const GLOBAL_TARGETS: Record<string, () => object | undefined> = {
  Array: () => Array.prototype,
  ArrayConstructor: () => Array,
  Document: () => Document.prototype,
  DocumentFragment: () => DocumentFragment.prototype,
  Element: () => Element.prototype,
  HTMLElement: () => HTMLElement.prototype,
  Math: () => Math,
  Node: () => Node.prototype,
  NumberConstructor: () => Number,
  ObjectConstructor: () => Object,
  String: () => String.prototype,
  StringConstructor: () => String,
  SVGElement: () => SVGElement.prototype,
  Touch: () => (typeof Touch === 'undefined' ? undefined : Touch.prototype),
  UIEvent: () => UIEvent.prototype,
  Window: () => globalThis
};

const MOCK_SUFFIX = '__';
const PROJECT_ROOT = process.cwd();
const MOCK_INDEX_PATH = join(PROJECT_ROOT, 'src', 'obsidian', 'index.ts');

/**
 * Burn-down backlog: conformance gaps that are temporarily tolerated so the test can
 * still enforce against NEW drift while a known gap is being mocked. Each entry is a
 * verbatim violation message. This set is currently EMPTY — the mocks are in full
 * conformance with `obsidian.d.ts`. Add an entry here only as a short-lived allowance
 * while implementing a newly-discovered gap, and remove it as soon as the gap is mocked.
 */
const CONFORMANCE_BACKLOG = new Set<string>();

const VALUE_FLAG_LIST = [
  SymbolFlags.BlockScopedVariable,
  SymbolFlags.Class,
  SymbolFlags.Enum,
  SymbolFlags.Function,
  SymbolFlags.ValueModule,
  SymbolFlags.Variable
];

interface ConformanceContext {
  checker: TypeChecker;
  mockExports: Map<string, TsSymbol>;
  obsidianExports: Map<string, TsSymbol>;
  obsidianSourceFile: SourceFile;
}

const { checker, mockExports, obsidianExports, obsidianSourceFile } = build();

/**
 * Every member name `obsidian-typings` declares, flattened across classes and interfaces.
 *
 * Deliberately flat rather than per-class: a member the augmentation declares on a base class
 * (`Component._loaded`) is inherited by every subclass, so a per-class lookup would reject it on the
 * ~30 classes that extend `Component`. Flattening is also exactly right for what this rule polices —
 * the question is "is this name a real Obsidian internal, or a mock-only member missing its marker?",
 * and any name in this set answers that with the former.
 */
const AUGMENTED_MEMBER_NAMES = getAllAugmentedMemberNames();

describe('obsidian.d.ts conformance', () => {
  it('should mock every public member of obsidian.d.ts, and suffix every extra member with __', () => {
    const violations: string[] = [];

    for (const [name, obsidianSymbol] of obsidianExports) {
      if (VALUE_FLAG_LIST.every((flag) => !hasFlag(obsidianSymbol.flags, flag))) {
        continue;
      }

      const mockSymbol = mockExports.get(name);
      if (!mockSymbol) {
        record(violations, `missing export "${name}"`);
        continue;
      }

      if (hasFlag(obsidianSymbol.flags, SymbolFlags.Class)) {
        compareClass(name, obsidianSymbol, mockSymbol, violations);
      }
    }

    for (const [name] of mockExports) {
      if (!obsidianExports.has(name) && !name.endsWith(MOCK_SUFFIX)) {
        record(violations, `extra export "${name}" must end with "${MOCK_SUFFIX}"`);
      }
    }

    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it('should implement every global member that obsidian.d.ts augments, with the declared kind', () => {
    const violations: string[] = [];

    for (const [interfaceName, members] of globalAugmentations(obsidianSourceFile)) {
      const getTarget = GLOBAL_TARGETS[interfaceName];
      if (!getTarget) {
        continue;
      }
      const target = getTarget();
      if (!target) {
        continue;
      }
      for (const [member, isValueTyped] of members) {
        // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
        if (!(member in target)) {
          record(violations, `global ${interfaceName}: missing member "${member}"`);
          continue;
        }
        if (isValueTyped && isImplementedAsMethod(target, member)) {
          record(violations, `global ${interfaceName}: member "${member}" must be a value property, not a method`);
        }
      }
    }

    expect(violations, formatViolations(violations)).toEqual([]);
  });
});

function build(): ConformanceContext {
  const configFile = readConfigFile(join(PROJECT_ROOT, 'tsconfig.json'), (path) => sys.readFile(path));
  const parsed = parseJsonConfigFileContent(configFile.config, sys, PROJECT_ROOT);
  const program = createProgram({ options: parsed.options, rootNames: parsed.fileNames });
  const typeChecker = program.getTypeChecker();

  const obsidianResolved = resolveModuleName('obsidian', MOCK_INDEX_PATH, parsed.options, sys).resolvedModule;
  if (!obsidianResolved) {
    throw new Error('Could not resolve the "obsidian" module.');
  }

  const obsidianSf = program.getSourceFile(obsidianResolved.resolvedFileName);
  const mockSf = program.getSourceFile(MOCK_INDEX_PATH);
  if (!obsidianSf || !mockSf) {
    throw new Error('Could not load the obsidian.d.ts or mock index source files.');
  }

  return {
    checker: typeChecker,
    mockExports: moduleExports(typeChecker, mockSf),
    obsidianExports: moduleExports(typeChecker, obsidianSf),
    obsidianSourceFile: obsidianSf
  };
}

function classMemberNames(classSymbol: TsSymbol): Set<string> {
  const names = collectMemberNames(checker.getDeclaredTypeOfSymbol(classSymbol));
  if (classSymbol.valueDeclaration) {
    for (const member of collectMemberNames(checker.getTypeOfSymbolAtLocation(classSymbol, classSymbol.valueDeclaration))) {
      names.add(member);
    }
  }
  return names;
}

function collectMemberNames(type: Type): Set<string> {
  const names = new Set<string>();
  for (const property of checker.getPropertiesOfType(type)) {
    const name = property.getName();
    if (name === 'prototype' || name.startsWith('__@')) {
      continue;
    }
    if (isPublic(property)) {
      names.add(name);
    }
  }
  return names;
}

function compareClass(name: string, obsidianSymbol: TsSymbol, mockSymbol: TsSymbol, violations: string[]): void {
  const obsidianMembers = classMemberNames(obsidianSymbol);
  const mockMembers = classMemberNames(mockSymbol);

  for (const member of obsidianMembers) {
    if (!mockMembers.has(member)) {
      record(violations, `${name}: missing member "${member}"`);
    }
  }

  for (const member of mockMembers) {
    if (!obsidianMembers.has(member) && !member.endsWith(MOCK_SUFFIX) && !AUGMENTED_MEMBER_NAMES.has(member)) {
      record(violations, `${name}: extra member "${member}" must end with "${MOCK_SUFFIX}" or be declared by obsidian-typings`);
    }
  }
}

function formatViolations(violations: string[]): string {
  if (violations.length === 0) {
    return '';
  }
  return `${String(violations.length)} conformance violation(s):\n${violations.map((violation) => `  - ${violation}`).join('\n')}`;
}

function globalAugmentations(sourceFile: SourceFile): Map<string, Map<string, boolean>> {
  const augmentations = new Map<string, Map<string, boolean>>();

  sourceFile.forEachChild((node) => {
    if (!isModuleDeclaration(node) || !hasFlag(node.flags, NodeFlags.GlobalAugmentation) || !node.body || !('statements' in node.body)) {
      return;
    }
    for (const statement of node.body.statements) {
      if (!isInterfaceDeclaration(statement)) {
        continue;
      }
      const interfaceName = statement.name.text;
      const members = augmentations.get(interfaceName) ?? new Map<string, boolean>();
      for (const member of statement.members) {
        const name = member.name?.getText(sourceFile);
        // Skip index signatures and obsidian-internal `_`-prefixed members (not part of the public API).
        if (!name || name.startsWith('[') || stripQuotes(name).startsWith('_')) {
          continue;
        }
        const memberName = stripQuotes(name);
        const isValueTyped = isPropertySignature(member) && member.type !== undefined && !isFunctionTypeNode(member.type);
        members.set(memberName, (members.get(memberName) ?? false) || isValueTyped);
      }
      augmentations.set(interfaceName, members);
    }
  });

  return augmentations;
}

function hasFlag(flags: number, mask: number): boolean {
  // eslint-disable-next-line no-bitwise -- Bitwise flag check against the TypeScript compiler's SymbolFlags / ModifierFlags / NodeFlags.
  return (flags & mask) !== 0;
}

function isImplementedAsMethod(target: object, member: string): boolean {
  for (let current: null | object = target; current; current = Object.getPrototypeOf(current) as null | object) {
    const descriptor = Object.getOwnPropertyDescriptor(current, member);
    if (descriptor) {
      return typeof descriptor.value === 'function';
    }
  }
  return false;
}

function isPublic(symbol: TsSymbol): boolean {
  for (const declaration of symbol.getDeclarations() ?? []) {
    const modifierFlags = getCombinedModifierFlags(declaration);
    if (hasFlag(modifierFlags, ModifierFlags.Private) || hasFlag(modifierFlags, ModifierFlags.Protected)) {
      return false;
    }
  }
  return true;
}

function moduleExports(typeChecker: TypeChecker, sourceFile: SourceFile): Map<string, TsSymbol> {
  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error('Could not resolve a module symbol.');
  }
  const result = new Map<string, TsSymbol>();
  for (const exportSymbol of typeChecker.getExportsOfModule(moduleSymbol)) {
    result.set(exportSymbol.getName(), exportSymbol);
  }
  return result;
}

function record(violations: string[], message: string): void {
  if (!CONFORMANCE_BACKLOG.has(message)) {
    violations.push(message);
  }
}

function stripQuotes(name: string): string {
  return name.replaceAll(/^['"]|['"]$/g, '');
}

/**
 * @file
 *
 * Conformance test enforcing L1 + L4 automatically:
 *
 * - Forward: every public member declared in `obsidian.d.ts` (classes and their
 *   instance/static members, plus the top-level value exports) must have an
 *   equivalent member in the mocks.
 * - Reverse: any extra public mock member that is NOT in `obsidian.d.ts` must end
 *   with the `__` mock-only suffix.
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

// eslint-disable-next-line import-x/no-nodejs-modules -- This conformance test reads obsidian.d.ts via the TypeScript compiler API.
import { join } from 'node:path';
// eslint-disable-next-line import-x/no-nodejs-modules -- This conformance test reads obsidian.d.ts via the TypeScript compiler API.
import process from 'node:process';
import {
  createProgram,
  getCombinedModifierFlags,
  isInterfaceDeclaration,
  isModuleDeclaration,
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
 * Burn-down backlog: known conformance gaps that pre-date this test. Each entry is
 * a verbatim violation message that is temporarily tolerated so the test can enforce
 * against NEW drift immediately. Remove an entry as soon as its gap is mocked; the
 * goal is an empty set (full obsidian.d.ts conformance).
 */
const CONFORMANCE_BACKLOG = new Set<string>([
  'AbstractInputSuggest: missing member "limit"',
  'AbstractInputSuggest: missing member "onSelect"',
  'App: missing member "renderContext"',
  'App: missing member "secretStorage"',
  'BasesView: missing member "allProperties"',
  'BasesView: missing member "app"',
  'BasesView: missing member "config"',
  'BasesView: missing member "createFileForView"',
  'BasesView: missing member "data"',
  'BasesView: missing member "onDataUpdated"',
  'BasesView: missing member "type"',
  'EditorSuggest: missing member "context"',
  'FuzzySuggestModal: missing member "selectActiveSuggestion"',
  'MarkdownEditView: missing member "file"',
  'MarkdownPreviewRenderer: missing member "createCodeBlockPostProcessor"',
  'PluginSettingTab: extra member "plugin" must end with "__"',
  'SuggestModal: missing member "selectActiveSuggestion"',
  'Workspace: missing member "handleLinkContextMenu"',
  'WorkspaceLeaf: missing member "open"'
]);

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

describe('obsidian.d.ts conformance', () => {
  it('should mock every public member of obsidian.d.ts, and suffix every extra member with __', () => {
    const violations: string[] = [];

    for (const [name, obsidianSymbol] of obsidianExports) {
      if (!VALUE_FLAG_LIST.some((flag) => hasFlag(obsidianSymbol.flags, flag))) {
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

  it('should implement every global member that obsidian.d.ts augments', () => {
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
      for (const member of members) {
        if (!(member in target)) {
          record(violations, `global ${interfaceName}: missing member "${member}"`);
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
    if (!obsidianMembers.has(member) && !member.endsWith(MOCK_SUFFIX)) {
      record(violations, `${name}: extra member "${member}" must end with "${MOCK_SUFFIX}"`);
    }
  }
}

function formatViolations(violations: string[]): string {
  if (violations.length === 0) {
    return '';
  }
  return `${String(violations.length)} conformance violation(s):\n${violations.map((violation) => `  - ${violation}`).join('\n')}`;
}

function globalAugmentations(sourceFile: SourceFile): Map<string, Set<string>> {
  const augmentations = new Map<string, Set<string>>();

  sourceFile.forEachChild((node) => {
    if (!isModuleDeclaration(node) || !hasFlag(node.flags, NodeFlags.GlobalAugmentation) || !node.body || !('statements' in node.body)) {
      return;
    }
    for (const statement of node.body.statements) {
      if (!isInterfaceDeclaration(statement)) {
        continue;
      }
      const interfaceName = statement.name.text;
      const members = augmentations.get(interfaceName) ?? new Set<string>();
      for (const member of statement.members) {
        const name = member.name?.getText(sourceFile);
        // Skip index signatures and obsidian-internal `_`-prefixed members (not part of the public API).
        if (name && !name.startsWith('[') && !stripQuotes(name).startsWith('_')) {
          members.add(stripQuotes(name));
        }
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
  return name.replace(/^['"]|['"]$/g, '');
}

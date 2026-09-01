/**
 * @file
 *
 * Enumerates the surface `obsidian-typings` adds on top of `obsidian.d.ts`.
 *
 * This is the single source of truth behind two checks:
 *
 * - `conformance.test.ts`'s reverse rule, which must not reject a mock member that carries a real
 *   Obsidian internal's name rather than the `__` mock-only suffix.
 * - `obsidian-typings-conformance.test.ts`, which asserts every member of that surface carries an
 *   explicit implemented / not-implemented decision, so an `obsidian-typings` upgrade surfaces new
 *   members as a failing test instead of drifting silently.
 *
 * It builds its **own** `Program` rather than reusing the project's. `obsidian-typings` augments
 * `declare module 'obsidian'` globally on import, so pulling it into the main program would make every
 * augmented member look like part of `obsidian.d.ts` — the side effect L3 exists to prevent. Keeping it
 * in a throwaway program means the augmentation is visible here and nowhere else.
 *
 * Members are read per DECLARATION SITE, not off the merged type: `getPropertiesOfType()` returns
 * inherited members too, which would attribute `Component._loaded` to all 30-odd classes that extend it.
 */

import type {
  ClassDeclaration,
  CompilerOptions,
  InterfaceDeclaration,
  SourceFile,
  Symbol as TsSymbol,
  TypeChecker
} from 'typescript';

import { join } from 'node:path';
import process from 'node:process';
import {
  createProgram,
  isClassDeclaration,
  isInterfaceDeclaration,
  isModuleDeclaration,
  isStringLiteral,
  parseJsonConfigFileContent,
  readConfigFile,
  resolveModuleName,
  SymbolFlags,
  sys
} from 'typescript';

/**
 * The `__` suffix marking a mock-only member (L4).
 *
 * `obsidian-typings` declares over 160 of these itself, as optional members mirroring this package's own
 * convention. They are this package's vocabulary reflected back, not Obsidian internals, so they are
 * excluded from the surface — implementing them under a "real" name would be circular.
 */
const MOCK_SUFFIX = '__';

const OBSIDIAN_MODULE_NAME = 'obsidian';
const OBSIDIAN_TYPINGS_MODULE_NAME = 'obsidian-typings';

/**
 * The checked-in inventory's file name, relative to `scripts/`.
 *
 * Shared by the generator that writes it and the test that asserts it, so the two can never drift onto
 * different paths.
 */
export const UNIMPLEMENTED_MEMBERS_FILE_NAME = 'obsidian-typings-unimplemented.json';

/**
 * The guide whose "What the mocks implement" table is generated.
 */
export const GUIDE_PATH = 'docs/src/content/docs/guides/obsidian-typings.md';

/**
 * Opens the generated region of {@link GUIDE_PATH}.
 */
export const GENERATED_BEGIN_MARKER = '<!-- BEGIN GENERATED: implemented-internals -->';

/**
 * Closes the generated region of {@link GUIDE_PATH}.
 */
export const GENERATED_END_MARKER = '<!-- END GENERATED: implemented-internals -->';

/**
 * The throwaway program every lookup here reads from.
 *
 * Built once, eagerly, because it parses roughly 76,000 lines of rolled-up declarations and all three
 * exported functions need it. Only the conformance tests and the surface generator import this module,
 * and each of them uses the program, so there is nothing to defer it for.
 */
const CONTEXT = buildContext();

/**
 * The members `obsidian-typings` adds to a single class.
 */
export interface AugmentedClass {
  /**
   * Member names the augmentation declares that `obsidian.d.ts` does not, sorted.
   */
  readonly members: readonly string[];
  /**
   * The class name, as exported from `obsidian`.
   */
  readonly name: string;
}

interface SurfaceContext {
  readonly checker: TypeChecker;
  readonly mockSourceFile: SourceFile;
  readonly obsidianPath: string;
  readonly obsidianSourceFile: SourceFile;
  readonly typingsSourceFiles: readonly SourceFile[];
}

/**
 * Every member name `obsidian-typings` declares inside a `declare module 'obsidian'` block, flattened
 * across classes AND interfaces.
 *
 * Broader than {@link getAugmentedSurface} on purpose, in two ways.
 *
 * It covers interfaces as well as classes, and it reads the MERGED property list off the checker rather
 * than own declarations — so it follows heritage clauses. Both matter for real cases: `insensitive` is
 * declared on `DataAdapterEx`, a helper interface the augmentation makes `CapacitorAdapter` and
 * `FileSystemAdapter` extend, so neither an own-declaration walk nor a class-only filter would find it.
 *
 * This set answers exactly one question: "is this name a real Obsidian internal, or a mock-only member
 * missing its marker?" Names `obsidian.d.ts` already declares may appear in it, which is harmless — such
 * a member is matched by the forward rule long before the reverse rule sees it.
 *
 * @returns Every augmented member name, excluding `__`-suffixed ones and index signatures.
 */
export function getAllAugmentedMemberNames(): Set<string> {
  const { checker, typingsSourceFiles } = CONTEXT;
  const names = new Set<string>();

  for (const sourceFile of typingsSourceFiles) {
    sourceFile.forEachChild((node) => {
      if (!isModuleDeclaration(node) || !isStringLiteral(node.name) || node.name.text !== OBSIDIAN_MODULE_NAME) {
        return;
      }
      if (!node.body || !('statements' in node.body)) {
        return;
      }
      for (const statement of node.body.statements) {
        if (!isClassDeclaration(statement) && !isInterfaceDeclaration(statement)) {
          continue;
        }
        if (!statement.name) {
          continue;
        }
        const symbol = checker.getSymbolAtLocation(statement.name);
        if (!symbol) {
          continue;
        }
        for (const property of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))) {
          const name = property.getName();
          if (name === 'prototype' || name.startsWith('__@') || name.endsWith(MOCK_SUFFIX)) {
            continue;
          }
          names.add(name);
        }
      }
    });
  }

  return names;
}

/**
 * Enumerates the `obsidian-typings` surface for every class the mocks implement.
 *
 * @returns One entry per mocked class that the augmentation extends, sorted by class name.
 */
export function getAugmentedSurface(): AugmentedClass[] {
  const { checker, mockSourceFile, obsidianPath, obsidianSourceFile } = CONTEXT;

  const obsidianExports = moduleExports(checker, obsidianSourceFile);
  const mockExports = moduleExports(checker, mockSourceFile);

  const result: AugmentedClass[] = [];

  for (const [name, symbol] of obsidianExports) {
    if (!hasFlag(symbol.flags, SymbolFlags.Class) || !mockExports.has(name)) {
      continue;
    }

    const declaredByObsidian = new Set<string>();
    const declaredByTypings = new Set<string>();

    for (const declaration of symbol.getDeclarations() ?? []) {
      if (!isClassDeclaration(declaration) && !isInterfaceDeclaration(declaration)) {
        continue;
      }
      const isObsidian = declaration.getSourceFile().fileName === obsidianPath;
      const target = isObsidian ? declaredByObsidian : declaredByTypings;
      for (const member of ownMemberNames(declaration)) {
        target.add(member);
      }
    }

    const members = [...declaredByTypings].filter((member) => !declaredByObsidian.has(member)).sort();
    if (members.length > 0) {
      result.push({ members, name });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Every augmented member the mocks do NOT implement, as `Class.member`, sorted.
 *
 * This is the inventory the checked-in snapshot holds, and the reason coverage is a decision rather
 * than an accident: a member can only leave the list by being implemented, and can only enter it by an
 * `obsidian-typings` upgrade introducing it — either way the snapshot test goes red first.
 *
 * @returns The qualified names of the augmented members no mock implements.
 */
export function getUnimplementedAugmentedMembers(): string[] {
  const { checker, mockSourceFile } = CONTEXT;
  const mockExports = moduleExports(checker, mockSourceFile);
  const result: string[] = [];

  for (const augmented of getAugmentedSurface()) {
    const mockSymbol = mockExports.get(augmented.name);
    if (!mockSymbol) {
      continue;
    }
    const implemented = declaredMemberNames(checker, mockSymbol);
    for (const member of augmented.members) {
      if (!implemented.has(member)) {
        result.push(`${augmented.name}.${member}`);
      }
    }
  }

  return result.sort();
}

/**
 * Renders the markdown table of augmented members the mocks implement.
 *
 * Generated rather than hand-written: a hand-maintained table of exactly this is what went stale and
 * became the reason this whole area was reworked.
 *
 * @returns The table, one row per class, without the surrounding markers.
 */
export function renderImplementedTable(): string {
  const unimplemented = new Set(getUnimplementedAugmentedMembers());
  const rows: string[] = [
    '| Class | Members |',
    '| --- | --- |'
  ];

  for (const augmented of getAugmentedSurface()) {
    const implemented = augmented.members.filter((member) => !unimplemented.has(`${augmented.name}.${member}`));
    if (implemented.length === 0) {
      continue;
    }
    rows.push(`| \`${augmented.name}\` | ${implemented.map((member) => `\`${member}\``).join(', ')} |`);
  }

  return rows.join('\n');
}

function buildContext(): SurfaceContext {
  const projectRoot = process.cwd();
  const mockIndexPath = join(projectRoot, 'src', 'obsidian', 'index.ts');

  const configFile = readConfigFile(join(projectRoot, 'tsconfig.json'), (path) => sys.readFile(path));
  const parsed = parseJsonConfigFileContent(configFile.config, sys, projectRoot);

  const obsidianPath = resolveModule(OBSIDIAN_MODULE_NAME, mockIndexPath, parsed.options);
  const typingsPath = resolveModule(OBSIDIAN_TYPINGS_MODULE_NAME, mockIndexPath, parsed.options);

  const program = createProgram({
    options: parsed.options,
    rootNames: [obsidianPath, typingsPath, mockIndexPath]
  });
  const checker = program.getTypeChecker();

  const obsidianSourceFile = program.getSourceFile(obsidianPath);
  const mockSourceFile = program.getSourceFile(mockIndexPath);
  if (!obsidianSourceFile || !mockSourceFile) {
    throw new Error('Could not load the obsidian.d.ts or mock index source files.');
  }

  // The `obsidian-typings` specifier resolves to a one-line facade that re-exports the versioned
  // `@obsidian-typings/obsidian-public-<version>` package, and the augmentation blocks live in the
  // Latter. Collect every source file in the program that belongs to either, so the walk finds them
  // Regardless of which package carries the declarations.
  const typingsSourceFiles = program.getSourceFiles().filter((sourceFile) => sourceFile.fileName.includes(OBSIDIAN_TYPINGS_MODULE_NAME));

  return {
    checker,
    mockSourceFile,
    obsidianPath,
    obsidianSourceFile,
    typingsSourceFiles
  };
}

/**
 * Every member of a mock class, inherited and instance fields included.
 *
 * Read off the checker rather than the prototype on purpose: an instance field assigned in the
 * constructor (`App.appId`) never appears on the prototype, so a runtime `in` check would report it
 * unimplemented.
 */
function declaredMemberNames(checker: TypeChecker, classSymbol: TsSymbol): Set<string> {
  const names = new Set<string>();
  for (const property of checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(classSymbol))) {
    const name = property.getName();
    if (name === 'prototype' || name.startsWith('__@')) {
      continue;
    }
    names.add(name);
  }
  return names;
}

function hasFlag(flags: number, mask: number): boolean {
  // eslint-disable-next-line no-bitwise -- Bitwise flag check against the TypeScript compiler's SymbolFlags.
  return (flags & mask) !== 0;
}

function moduleExports(checker: TypeChecker, sourceFile: SourceFile): Map<string, TsSymbol> {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error(`Could not resolve a module symbol for "${sourceFile.fileName}".`);
  }
  const result = new Map<string, TsSymbol>();
  for (const exportSymbol of checker.getExportsOfModule(moduleSymbol)) {
    result.set(exportSymbol.getName(), exportSymbol);
  }
  return result;
}

/**
 * Names of the members `declaration` itself declares — never inherited ones.
 */
function ownMemberNames(declaration: ClassDeclaration | InterfaceDeclaration): string[] {
  const names: string[] = [];
  const sourceFile = declaration.getSourceFile();

  for (const member of declaration.members) {
    const rawName = member.name?.getText(sourceFile);
    // Skip index signatures, which have no name to implement.
    if (!rawName || rawName.startsWith('[')) {
      continue;
    }
    const name = stripQuotes(rawName);
    if (name.endsWith(MOCK_SUFFIX)) {
      continue;
    }
    names.push(name);
  }

  return names;
}

function resolveModule(moduleName: string, containingFile: string, options: CompilerOptions): string {
  const resolved = resolveModuleName(moduleName, containingFile, options, sys).resolvedModule;
  if (!resolved) {
    throw new Error(`Could not resolve the "${moduleName}" module.`);
  }
  return resolved.resolvedFileName;
}

function stripQuotes(name: string): string {
  return name.replaceAll(/^['"]|['"]$/g, '');
}

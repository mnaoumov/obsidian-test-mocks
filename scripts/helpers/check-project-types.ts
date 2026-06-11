/**
 * @file
 *
 * Type-checks a set of TypeScript files with `skipLibCheck` disabled, but reports only the
 * diagnostics whose source file we own. This lets the general build run with `skipLibCheck: true`
 * (so it does not fail on broken upstream `.d.ts` files we do not control, such as a given
 * version's `@vitest/runner` declarations) while still fully validating the declarations we author.
 *
 * When upstream types are fixed, the `Ignored N diagnostic(s)` count drops to `0`, signalling the
 * workaround is no longer doing anything.
 */

import type {
  CompilerOptions,
  Diagnostic,
  FormatDiagnosticsHost,
  ParseConfigFileHost
} from 'typescript';

import process from 'node:process';
import {
  createProgram,
  DiagnosticCategory,
  formatDiagnostic,
  formatDiagnostics,
  formatDiagnosticsWithColorAndContext,
  getParsedCommandLineOfConfigFile,
  getPreEmitDiagnostics,
  sys
} from 'typescript';

export interface CheckProjectTypesParams {
  readonly options: CompilerOptions;
  readonly rootNames: readonly string[];
  shouldKeepFile(this: void, fileName: string): boolean;
}

export interface ParsedTsConfig {
  readonly fileNames: readonly string[];
  readonly options: CompilerOptions;
}

const FORMAT_HOST: FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => sys.getCurrentDirectory(),
  getNewLine: () => sys.newLine
};

export function checkProjectTypes(params: CheckProjectTypesParams): boolean {
  const options: CompilerOptions = {
    ...params.options,
    skipLibCheck: false
  };

  const program = createProgram({
    options,
    rootNames: [...params.rootNames]
  });

  const allDiagnostics = getPreEmitDiagnostics(program);
  const keptDiagnostics = allDiagnostics.filter((diagnostic) => shouldKeepDiagnostic(diagnostic, params.shouldKeepFile));
  const ignoredCount = allDiagnostics.length - keptDiagnostics.length;

  if (keptDiagnostics.length > 0) {
    process.stdout.write(formatDiagnosticsWithColorAndContext(keptDiagnostics, FORMAT_HOST));
  }

  process.stdout.write(`Ignored ${String(ignoredCount)} diagnostic(s) outside the validated set.\n`);

  return !keptDiagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error);
}

export function parseTsConfig(tsConfigPath: string): ParsedTsConfig {
  const host: ParseConfigFileHost = {
    fileExists: (path) => sys.fileExists(path),
    getCurrentDirectory: () => sys.getCurrentDirectory(),
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(formatDiagnostic(diagnostic, FORMAT_HOST));
    },
    readDirectory: (rootDir, extensions, excludes, includes, depth) => sys.readDirectory(rootDir, extensions, excludes, includes, depth),
    readFile: (path) => sys.readFile(path),
    useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames
  };

  const parsed = getParsedCommandLineOfConfigFile(tsConfigPath, undefined, host);

  if (!parsed) {
    throw new Error(`Failed to parse TypeScript config: ${tsConfigPath}`);
  }

  if (parsed.errors.length > 0) {
    throw new Error(`Errors while parsing TypeScript config ${tsConfigPath}:\n${formatDiagnostics(parsed.errors, FORMAT_HOST)}`);
  }

  return {
    fileNames: parsed.fileNames,
    options: parsed.options
  };
}

export function toCanonical(fileName: string): string {
  const normalized = fileName.replaceAll('\\', '/');
  return sys.useCaseSensitiveFileNames ? normalized : normalized.toLowerCase();
}

function shouldKeepDiagnostic(diagnostic: Diagnostic, shouldKeepFile: (fileName: string) => boolean): boolean {
  if (!diagnostic.file) {
    return true;
  }

  return shouldKeepFile(toCanonical(diagnostic.file.fileName));
}

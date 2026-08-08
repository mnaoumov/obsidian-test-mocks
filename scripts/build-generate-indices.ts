import {
  readdir,
  readFile,
  stat,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';

exitIfScriptDisabled();

const EXPORT_PATTERN = /^export\s+(?:(?:abstract\s+)?class|(?:async\s+)?function|const|enum|interface|let|type|var)\s+(?<name>\w+)/gm;

interface BarrelResult {
  readonly claimedNames: Set<string>;
  readonly content: string;
}

interface TsFileEntry {
  readonly fullPath: string;
  readonly name: string;
}

async function collectTsFiles(directory: string): Promise<TsFileEntry[]> {
  const results: TsFileEntry[] = [];
  const entries = await readdir(directory);
  for (const entry of entries.sort()) {
    const full = join(directory, entry);
    const stats = await stat(full);
    if (stats.isDirectory()) {
      continue;
    }
    if (
      entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('.test.ts') && !entry.endsWith('-setup.ts') && entry !== 'index.ts'
      && entry !== 'setup.ts'
    ) {
      results.push({ fullPath: full, name: entry });
    }
  }
  return results;
}

async function doesDirectoryExist(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function generateBarrelIndexWithClaimedNames(directory: string): Promise<BarrelResult> {
  const claimedNames = new Set<string>();
  const lines: string[] = [];

  // Generate subdirectory barrels and re-export from them.
  const entries = await readdir(directory);
  for (const entry of entries.sort()) {
    const full = join(directory, entry);
    const stats = await stat(full);
    if (!stats.isDirectory()) {
      continue;
    }
    const subFiles = await collectTsFiles(full);
    if (subFiles.length === 0) {
      continue;
    }
    await generateSubdirectoryBarrel(full);
    lines.push(`export * from './${entry}/index.ts';`);
    for (const subFile of subFiles) {
      const content = await readFile(subFile.fullPath, 'utf-8');
      for (const name of parseExportedNames(content)) {
        claimedNames.add(name);
      }
    }
  }

  // Re-export root-level files, skipping names already claimed by subdirectories.
  for (const file of await collectTsFiles(directory)) {
    const content = await readFile(file.fullPath, 'utf-8');
    const allNames = parseExportedNames(content);
    const unclaimed = allNames.filter((n) => !claimedNames.has(n));

    if (unclaimed.length === 0) {
      continue;
    }

    if (unclaimed.length === allNames.length) {
      lines.push(`export * from './${file.name}';`);
    } else {
      const exports = unclaimed.join(',\n  ');
      lines.push(`export {\n  ${exports}\n} from './${file.name}';`);
    }

    for (const name of unclaimed) {
      claimedNames.add(name);
    }
  }

  return { claimedNames, content: `${lines.join('\n')}\n` };
}

async function generateGlobalsIndex(directory: string): Promise<string> {
  const importLines: string[] = [];
  const registrationLines: string[] = [];
  const teardownLines: string[] = [];
  const globalNamespaces: string[] = [];

  const POST_SETUP = 'post-setup.ts';
  const allRootFiles = await collectTsFiles(directory);
  const rootFiles = allRootFiles.filter((f) => f.name !== POST_SETUP);

  for (const file of rootFiles) {
    const modulePath = `./${file.name}`;
    const namespaceId = toNamespaceId(file.name);

    if (file.name.endsWith('.prototype.ts')) {
      const className = file.name.replace('.prototype.ts', '');
      importLines.push(`import * as ${namespaceId} from '${modulePath}';`);
      registrationLines.push(`Object.assign(${className}.prototype, ${namespaceId});`);
      teardownLines.push(`deleteKeys(${className}.prototype, ${namespaceId});`);
    } else {
      const className = file.name.replace('.ts', '');
      const nsId = `${namespaceId}_`;
      importLines.push(`import * as ${nsId} from '${modulePath}';`);
      registrationLines.push(`Object.assign(${className}, ${nsId});`);
      teardownLines.push(`deleteKeys(${className}, ${nsId});`);
    }
  }

  // Process functions/ subdirectory — generate its own index.ts barrel.
  const functionsDirectory = join(directory, 'functions');
  if (await doesDirectoryExist(functionsDirectory)) {
    await generateSubdirectoryBarrel(functionsDirectory);
    importLines.push('import * as functions from \'./functions/index.ts\';');
    globalNamespaces.push('functions');
  }

  // Process vars/ subdirectory — generate its own index.ts barrel.
  const variablesDirectory = join(directory, 'vars');
  if (await doesDirectoryExist(variablesDirectory)) {
    const variableFiles = await collectTsFiles(variablesDirectory);
    if (variableFiles.length > 0) {
      await generateSubdirectoryBarrel(variablesDirectory);
      importLines.push('import * as vars from \'./vars/index.ts\';');
      globalNamespaces.push('vars');
    }
  }

  // Register/teardown all global functions and vars on globalThis.
  for (const ns of globalNamespaces) {
    registrationLines.push(`Object.assign(globalThis, ${ns});`);
    teardownLines.push(`deleteKeys(globalThis, ${ns});`);
  }

  importLines.push(`import { postSetup, postTeardown } from './${POST_SETUP}';`);

  const lines: string[] = [
    ...importLines.sort(),
    '',
    'function deleteKeys(target: object, source: object): void {',
    '  for (const key of Object.keys(source)) {',
    '    delete (target as Record<string, unknown>)[key];',
    '  }',
    '}',
    '',
    'export function setup(): void {',
    `  ${registrationLines.sort().join('\n  ')}`,
    '  postSetup();',
    '}',
    '',
    'export function teardown(): void {',
    `  ${teardownLines.sort().join('\n  ')}`,
    '  postTeardown();',
    '}',
    ''
  ];

  return lines.join('\n');
}

async function generateSubdirectoryBarrel(directory: string): Promise<void> {
  const files = await collectTsFiles(directory);
  const lines = files.map((file) => `export * from './${file.name}';`);
  await writeFile(join(directory, 'index.ts'), `${lines.join('\n')}\n`, 'utf-8');
}

async function main(): Promise<void> {
  const globalsContent = await generateGlobalsIndex('src/globals');
  await writeFile(join('src/globals', 'setup.ts'), globalsContent, 'utf-8');

  const obsidianBarrel = await generateBarrelIndexWithClaimedNames('src/obsidian');
  await writeFile(join('src/obsidian', 'index.ts'), obsidianBarrel.content, 'utf-8');
}

function parseExportedNames(content: string): string[] {
  const names: string[] = [];
  let match: null | RegExpExecArray;
  while ((match = EXPORT_PATTERN.exec(content)) !== null) {
    const name = match.groups?.['name'];
    if (name !== undefined) {
      names.push(name);
    }
  }
  return names.sort();
}

function toNamespaceId(fileName: string): string {
  return fileName
    .replace('.ts', '').replaceAll(/[.-]/g, '_');
}

await main();

import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';

import { noopAsync } from '../src/internal/noop.ts';

const EXPORT_PATTERN = /^export\s+(?:(?:abstract\s+)?class|(?:async\s+)?function|const|enum|interface|let|type|var)\s+(?<name>\w+)/gm;

interface TsFileEntry {
  fullPath: string;
  name: string;
}

function collectTsFiles(dir: string): TsFileEntry[] {
  const results: TsFileEntry[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      continue;
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && entry !== 'index.ts') {
      results.push({ fullPath: full, name: entry });
    }
  }
  return results;
}

function directoryExists(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function generateBarrelIndex(dir: string): string {
  const claimedNames = new Set<string>();
  const lines: string[] = [];

  // Generate subdirectory barrels and re-export from them.
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) {
      continue;
    }
    const subFiles = collectTsFiles(full);
    if (subFiles.length === 0) {
      continue;
    }
    generateSubdirectoryBarrel(full);
    lines.push(`export * from './${entry}/index.ts';`);
    for (const subFile of subFiles) {
      const content = readFileSync(subFile.fullPath, 'utf-8');
      for (const name of parseExportedNames(content)) {
        claimedNames.add(name);
      }
    }
  }

  // Re-export root-level files, skipping names already claimed by subdirectories.
  for (const file of collectTsFiles(dir)) {
    const content = readFileSync(file.fullPath, 'utf-8');
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

  return `${lines.join('\n')}\n`;
}

function generateGlobalsIndex(dir: string): string {
  const importLines: string[] = [];
  const registrationLines: string[] = [];
  const globalNamespaces: string[] = [];

  const rootFiles = collectTsFiles(dir);

  for (const file of rootFiles) {
    const modulePath = `./${file.name}`;
    const namespaceId = toNamespaceId(file.name);

    if (file.name.endsWith('.prototype.ts')) {
      const className = file.name.replace('.prototype.ts', '');
      importLines.push(`import * as ${namespaceId} from '${modulePath}';`);
      registrationLines.push(`Object.assign(${className}.prototype, ${namespaceId});`);
    } else {
      const className = file.name.replace('.ts', '');
      const nsId = `${namespaceId}_`;
      importLines.push(`import * as ${nsId} from '${modulePath}';`);
      registrationLines.push(`Object.assign(${className}, ${nsId});`);
    }
  }

  // Process functions/ subdirectory — generate its own index.ts barrel.
  const functionsDir = join(dir, 'functions');
  if (directoryExists(functionsDir)) {
    generateSubdirectoryBarrel(functionsDir);
    importLines.push('import * as functions from \'./functions/index.ts\';');
    globalNamespaces.push('functions');
  }

  // Process vars/ subdirectory — generate its own index.ts barrel.
  const varsDir = join(dir, 'vars');
  if (directoryExists(varsDir)) {
    const varFiles = collectTsFiles(varsDir);
    if (varFiles.length > 0) {
      generateSubdirectoryBarrel(varsDir);
      importLines.push('import * as vars from \'./vars/index.ts\';');
      globalNamespaces.push('vars');
    }
  }

  // Register all global functions and vars on globalThis.
  for (const ns of globalNamespaces) {
    registrationLines.push(`Object.assign(globalThis, ${ns});`);
  }

  const lines: string[] = [];
  lines.push(...importLines.sort());
  lines.push('');
  lines.push(registrationLines.sort().join('\n'));
  lines.push('');

  return lines.join('\n');
}

function generateSubdirectoryBarrel(dir: string): void {
  const files = collectTsFiles(dir);
  const lines = files.map((file) => `export * from './${file.name}';`);
  writeFileSync(join(dir, 'index.ts'), `${lines.join('\n')}\n`);
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
    .replace('.ts', '')
    .replaceAll('.', '_')
    .replaceAll('-', '_');
}

await wrapCliTask(async () => {
  await noopAsync();

  // Generate globals index (side-effect registration file).
  const globalsContent = generateGlobalsIndex('src/globals');
  writeFileSync(join('src/globals', 'index.ts'), globalsContent);

  // Generate barrel indexes for obsidian and helpers.
  for (const dir of ['src/helpers', 'src/obsidian']) {
    const content = generateBarrelIndex(dir);
    writeFileSync(join(dir, 'index.ts'), content);
  }
});

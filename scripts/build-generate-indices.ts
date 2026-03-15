import {
  readdir,
  readFile,
  stat,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';

const EXPORT_PATTERN = /^export\s+(?:(?:abstract\s+)?class|(?:async\s+)?function|const|enum|interface|let|type|var)\s+(?<name>\w+)/gm;

interface BarrelResult {
  claimedNames: Set<string>;
  content: string;
}

interface TsFileEntry {
  fullPath: string;
  name: string;
}

async function collectTsFiles(dir: string): Promise<TsFileEntry[]> {
  const results: TsFileEntry[] = [];
  for (const entry of (await readdir(dir)).sort()) {
    const full = join(dir, entry);
    if ((await stat(full)).isDirectory()) {
      continue;
    }
    if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('.test.ts') && entry !== 'index.ts') {
      results.push({ fullPath: full, name: entry });
    }
  }
  return results;
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

async function generateBarrelIndexWithClaimedNames(dir: string): Promise<BarrelResult> {
  const claimedNames = new Set<string>();
  const lines: string[] = [];

  // Generate subdirectory barrels and re-export from them.
  for (const entry of (await readdir(dir)).sort()) {
    const full = join(dir, entry);
    if (!(await stat(full)).isDirectory()) {
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
  for (const file of await collectTsFiles(dir)) {
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

async function generateGlobalsIndex(dir: string): Promise<string> {
  const importLines: string[] = [];
  const registrationLines: string[] = [];
  const globalNamespaces: string[] = [];

  const rootFiles = await collectTsFiles(dir);

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
  if (await directoryExists(functionsDir)) {
    await generateSubdirectoryBarrel(functionsDir);
    importLines.push('import * as functions from \'./functions/index.ts\';');
    globalNamespaces.push('functions');
  }

  // Process vars/ subdirectory — generate its own index.ts barrel.
  const varsDir = join(dir, 'vars');
  if (await directoryExists(varsDir)) {
    const varFiles = await collectTsFiles(varsDir);
    if (varFiles.length > 0) {
      await generateSubdirectoryBarrel(varsDir);
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

async function generateSubdirectoryBarrel(dir: string): Promise<void> {
  const files = await collectTsFiles(dir);
  const lines = files.map((file) => `export * from './${file.name}';`);
  await writeFile(join(dir, 'index.ts'), `${lines.join('\n')}\n`, 'utf-8');
}

async function main(): Promise<void> {
  const globalsContent = await generateGlobalsIndex('src/globals');
  await writeFile(join('src/globals', 'index.ts'), globalsContent, 'utf-8');

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
    .replace('.ts', '')
    .replaceAll('.', '_')
    .replaceAll('-', '_');
}

await main();

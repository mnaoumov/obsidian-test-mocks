import {
  cpSync,
  readdirSync,
  renameSync,
  statSync
} from 'node:fs';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';

import { execFromRoot } from './helpers/exec.ts';

const ESM_DIR = 'dist/lib/esm';
const CJS_DIR = 'dist/lib/cjs';

function collectFiles(dir: string, ext: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...collectFiles(full, ext));
    } else if (full.endsWith(ext)) {
      result.push(full);
    }
  }
  return result;
}

async function main(): Promise<void> {
  await execFromRoot('tsc --project tsconfig.build.json');
  await rewriteAndRenameDeclarations(ESM_DIR, '.d.mts');
  cpSync(ESM_DIR, CJS_DIR, { filter: (src) => src.endsWith('.d.mts') || statSync(src).isDirectory(), recursive: true });
  await rewriteAndRenameDeclarations(CJS_DIR, '.d.cts');
}

async function rewriteAndRenameDeclarations(dir: string, targetExt: string): Promise<void> {
  const dtsFiles = collectFiles(dir, '.d.ts');
  const dmtsFiles = collectFiles(dir, '.d.mts');
  const files = [...dtsFiles, ...dmtsFiles];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8');
    const rewritten = content.replace(
      /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.(?:d\.mts|d\.ts|ts)(?<quote>['"])/g,
      `$<prefix>$<path>${targetExt}$<quote>`
    );
    await writeFile(filePath, rewritten, 'utf8');

    if (!filePath.endsWith(targetExt)) {
      const newPath = filePath.replace(/\.d\.[cm]?ts$/, targetExt);
      renameSync(filePath, newPath);
    }
  }
}

await main();

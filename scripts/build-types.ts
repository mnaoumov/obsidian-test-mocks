import {
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync
} from 'node:fs';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  dirname,
  join
} from 'node:path';

import { execFromRoot } from './helpers/root.ts';

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

  const dtsFiles = collectFiles(ESM_DIR, '.d.ts');

  for (const filePath of dtsFiles) {
    const normalized = toForwardSlash(filePath);
    const content = await readFile(filePath, 'utf8');

    // Write .d.mts with .mjs import extensions (TypeScript resolves .mjs → .d.mts automatically,
    // Avoiding TS2846 "declaration file imported without import type" errors).
    const esmPath = normalized.replace(/\.d\.ts$/, '.d.mts');
    await writeFile(esmPath, rewriteImportExtensions(content, '.mjs'), 'utf8');

    // Write .d.cts with .cjs import extensions (TypeScript resolves .cjs → .d.cts automatically).
    const cjsPath = normalized.replace(ESM_DIR, CJS_DIR).replace(/\.d\.ts$/, '.d.cts');
    mkdirSync(dirname(cjsPath), { recursive: true });
    await writeFile(cjsPath, rewriteImportExtensions(content, '.cjs'), 'utf8');

    unlinkSync(filePath);
  }
}

function rewriteImportExtensions(content: string, targetExt: string): string {
  return content.replace(
    /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
    `$<prefix>$<path>${targetExt}$<quote>`
  );
}

function toForwardSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

await main();

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

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { execFromRoot } from './helpers/root.ts';

exitIfScriptDisabled();

const ESM_DIR = 'dist/lib/esm';
const CJS_DIR = 'dist/lib/cjs';

function collectFiles(directory: string, extension: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) {
      result.push(...collectFiles(full, extension));
    } else if (full.endsWith(extension)) {
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
    const content = await readFile(filePath, 'utf-8');

    // Write .d.mts with .mjs import extensions (TypeScript resolves .mjs → .d.mts automatically,
    // Avoiding TS2846 "declaration file imported without import type" errors).
    const esmPath = normalized.replace(/\.d\.ts$/, '.d.mts');
    await writeFile(esmPath, rewriteImportExtensions(content, '.mjs'), 'utf-8');

    // Write .d.cts with .cjs import extensions (TypeScript resolves .cjs → .d.cts automatically).
    // eslint-disable-next-line unicorn/no-unsafe-string-replacement -- `CJS_DIR` is a local literal constant with no `$` sequences in it.
    const cjsPath = normalized.replace(ESM_DIR, CJS_DIR).replace(/\.d\.ts$/, '.d.cts');
    mkdirSync(dirname(cjsPath), { recursive: true });
    await writeFile(cjsPath, rewriteImportExtensions(content, '.cjs'), 'utf-8');

    unlinkSync(filePath);
  }
}

function rewriteImportExtensions(content: string, targetExtension: string): string {
  return content.replaceAll(
    /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
    // eslint-disable-next-line unicorn/no-unsafe-string-replacement -- The `$<prefix>`/`$<path>`/`$<quote>` placeholders are the POINT of this replacement, and the only interpolated part is `targetExt`, always one of the two local `.mjs`/`.cjs` literals.
    `$<prefix>$<path>${targetExtension}$<quote>`
  );
}

function toForwardSlash(p: string): string {
  return p.replaceAll('\\', '/');
}

await main();

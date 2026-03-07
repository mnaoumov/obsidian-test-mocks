import { build } from 'esbuild';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function getEntryPoints(dir, base = dir) {
  const entries = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      entries.push(...getEntryPoints(full, base));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
      entries.push(full);
    }
  }
  return entries;
}

const entryPoints = getEntryPoints('src');

const commonOptions = {
  entryPoints,
  bundle: false,
  platform: 'node',
  target: 'es2024',
  sourcemap: 'inline',
};

await Promise.all([
  build({
    ...commonOptions,
    outdir: 'dist/lib/esm',
    format: 'esm',
    outExtension: { '.js': '.mjs' },
  }),
  build({
    ...commonOptions,
    outdir: 'dist/lib/cjs',
    format: 'cjs',
    outExtension: { '.js': '.cjs' },
  }),
]);

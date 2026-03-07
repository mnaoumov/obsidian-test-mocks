import { build } from 'esbuild';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function getEntryPoints(dir: string): string[] {
  const entries: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      entries.push(...getEntryPoints(full));
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
  platform: 'node' as const,
  target: 'es2024',
  sourcemap: 'inline' as const,
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

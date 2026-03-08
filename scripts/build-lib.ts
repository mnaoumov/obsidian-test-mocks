import { build } from 'esbuild';
import {
  readdirSync,
  statSync
} from 'node:fs';
import { join } from 'node:path';
import { wrapCliTask } from 'obsidian-dev-utils/ScriptUtils/CliUtils';

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

await wrapCliTask(async () => {
  const entryPoints = getEntryPoints('src');

  const commonOptions = {
    bundle: false,
    entryPoints,
    platform: 'node' as const,
    sourcemap: 'inline' as const,
    target: 'es2024'
  };

  await Promise.all([
    build({
      ...commonOptions,
      format: 'esm',
      outdir: 'dist/lib/esm',
      outExtension: { '.js': '.mjs' }
    }),
    build({
      ...commonOptions,
      format: 'cjs',
      outdir: 'dist/lib/cjs',
      outExtension: { '.js': '.cjs' }
    })
  ]);
});

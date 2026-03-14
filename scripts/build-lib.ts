import type { Plugin } from 'esbuild';

import { build } from 'esbuild';
import {
  readdirSync,
  statSync
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

function getEntryPoints(dir: string): string[] {
  const entries: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      entries.push(...getEntryPoints(full));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts') && !entry.endsWith('.test.ts')) {
      entries.push(full);
    }
  }
  return entries;
}

async function main(): Promise<void> {
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
      outExtension: { '.js': '.mjs' },
      plugins: [rewriteExtensionsPlugin('.mjs')]
    }),
    build({
      ...commonOptions,
      format: 'cjs',
      outdir: 'dist/lib/cjs',
      outExtension: { '.js': '.cjs' },
      plugins: [rewriteExtensionsPlugin('.cjs')]
    })
  ]);
}

function rewriteExtensionsPlugin(ext: string): Plugin {
  return {
    name: 'rewrite-ts-extensions',
    setup(pluginBuild): void {
      pluginBuild.onLoad({ filter: /\.ts$/ }, async (args) => {
        const contents = await readFile(args.path, 'utf8');
        return {
          contents: contents.replace(
            /(?<prefix>from\s+['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
            `$<prefix>$<path>${ext}$<quote>`
          ),
          loader: 'ts'
        };
      });
    }
  };
}

await main();

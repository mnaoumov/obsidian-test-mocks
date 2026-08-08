import type { Plugin } from 'esbuild';

import { build } from 'esbuild';
import {
  readdirSync,
  statSync
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';

exitIfScriptDisabled();

function getEntryPoints(directory: string): string[] {
  const entries: string[] = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
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

function rewriteExtensionsPlugin(extension: string): Plugin {
  return {
    name: 'rewrite-ts-extensions',
    setup(pluginBuild): void {
      pluginBuild.onLoad({ filter: /\.ts$/ }, async ($arguments) => {
        const contents = await readFile($arguments.path, 'utf-8');
        return {
          contents: contents.replaceAll(
            /(?<prefix>(?:from|import\()\s*['"])(?<path>[^'"]*?)\.ts(?<quote>['"])/g,
            // eslint-disable-next-line unicorn/no-unsafe-string-replacement -- The `$<prefix>`/`$<path>`/`$<quote>` placeholders are the POINT of this replacement, and the only interpolated part is the local `ext` constant.
            `$<prefix>$<path>${extension}$<quote>`
          ),
          loader: 'ts'
        };
      });
    }
  };
}

await main();

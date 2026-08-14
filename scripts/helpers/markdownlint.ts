import { glob } from 'node:fs/promises';
import { relative } from 'node:path';
import process from 'node:process';

import {
  execFromRoot,
  toPosixPath
} from './root.ts';

interface LintOptions {
  readonly paths?: string[] | undefined;
  readonly shouldFix?: boolean | undefined;
}

export async function lint(options?: LintOptions): Promise<void> {
  const { paths, shouldFix = false } = options ?? {};
  const targets = paths?.length ? paths : ['.'];
  await execFromRoot(['npx', 'markdownlint-cli2', ...(shouldFix ? ['--fix'] : []), { batchedArguments: targets }]);

  const mdFiles = paths?.length
    ? paths.map((p) => toPosixPath(relative(process.cwd(), p)) || p)
    : await toArray(glob(['**/*.md'], {
      exclude: [
        '.git/**',
        'dist/**',
        // The documentation site's own markdown is validated by `docs:build`, whose link check walks the
        // BUILT html. Handing it to linkinator instead resolves a base-absolute in-site link
        // (`/obsidian-test-mocks/guides/...`) against the containing folder, so every one of them 404s.
        'docs/**',
        'node_modules/**'
      ]
    }));
  await execFromRoot([
    'npx',
    'linkinator',
    '--retry',
    '--retry-errors',
    '--retry-errors-count',
    '3',
    '--retry-errors-jitter',
    '5',
    '--url-rewrite-search',
    String.raw`https://www\.npmjs\.com/package/`,
    '--url-rewrite-replace',
    'https://registry.npmjs.org/',
    { batchedArguments: mdFiles }
  ]);
}

async function toArray<T>(iter: AsyncIterableIterator<T>): Promise<T[]> {
  const array: T[] = [];
  for await (const item of iter) {
    array.push(item);
  }
  return array;
}

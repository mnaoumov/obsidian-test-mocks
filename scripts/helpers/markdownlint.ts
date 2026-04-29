import { glob } from 'node:fs/promises';
import { relative } from 'node:path';
import process from 'node:process';

import {
  execFromRoot,
  toPosixPath
} from './root.ts';

interface LintParams {
  paths?: string[] | undefined;
  shouldFix?: boolean | undefined;
}

export async function lint(params?: LintParams): Promise<void> {
  const { paths, shouldFix = false } = params ?? {};
  const targets = paths?.length ? paths : ['.'];
  await execFromRoot(['npx', 'markdownlint-cli2', ...(shouldFix ? ['--fix'] : []), { batchedArgs: targets }]);

  const mdFiles = paths?.length
    ? paths.map((p) => toPosixPath(relative(process.cwd(), p)))
    : await toArray(glob(['**/*.md'], {
      exclude: [
        '.git/**',
        'dist/**',
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
    'https://www\\.npmjs\\.com/package/',
    '--url-rewrite-replace',
    'https://registry.npmjs.org/',
    { batchedArgs: mdFiles }
  ]);
}

async function toArray<T>(iter: AsyncIterableIterator<T>): Promise<T[]> {
  const arr: T[] = [];
  for await (const item of iter) {
    arr.push(item);
  }
  return arr;
}

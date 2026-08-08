import { join } from 'node:path/posix';

import {
  execFromRoot,
  getRootFolder
} from './root.ts';
import { assertNonNullable } from './type-guards.ts';

interface FormatOptions {
  readonly paths?: string[] | undefined;
  readonly rewrite?: boolean | undefined;
}

export async function format(options?: FormatOptions): Promise<void> {
  const { paths, rewrite = true } = options ?? {};
  const rootFolder = getRootFolder();
  assertNonNullable(rootFolder, 'Root folder not found');

  const command = rewrite ? 'fmt' : 'check';
  const targets = paths?.length ? paths : ['**/*'];
  await execFromRoot(['npx', 'dprint', command, '--config', join(rootFolder, 'dprint.json'), { batchedArguments: targets }]);
}

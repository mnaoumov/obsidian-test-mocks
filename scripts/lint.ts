import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { lint } from '@mnaoumov/typescript-dev-toolkit/linters/eslint';
import process from 'node:process';

await wrapCliTask(async () => {
  const [, , ...paths] = process.argv;

  await lint({ paths, shouldFix: false });
});

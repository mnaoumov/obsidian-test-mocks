import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { lint } from '@mnaoumov/typescript-dev-toolkit/linters/markdownlint';
import process from 'node:process';

import { getMarkdownLintTargets } from './helpers/markdown-lint-targets.ts';

await wrapCliTask(async () => {
  const [, , ...paths] = process.argv;

  await lint({ paths: await getMarkdownLintTargets(paths), shouldFix: true });
});

import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { lint } from '@mnaoumov/typescript-dev-toolkit/linters/markdownlint';
import process from 'node:process';

await wrapCliTask(async () => {
  const [, , ...paths] = process.argv;

  // The guides link base-absolutely and resolve only against the built site, which `docs:build` link-checks.
  await lint({ linkCheckExcludeGlobs: ['docs/**'], paths, shouldFix: true });
});

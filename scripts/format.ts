import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { format } from '@mnaoumov/typescript-dev-toolkit/formatters/dprint';
import process from 'node:process';

await wrapCliTask(async () => {
  const [, , ...paths] = process.argv;

  await format({ paths, rewrite: true });
});

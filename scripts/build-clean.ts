import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { rm } from 'node:fs/promises';

await wrapCliTask(async () => {
  await rm('dist', { force: true, recursive: true });
});

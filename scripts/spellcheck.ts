import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { resolveToolCommand } from '@mnaoumov/typescript-dev-toolkit/package-manager';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';
import process from 'node:process';

async function main(): Promise<void> {
  const [, , ...paths] = process.argv;
  await spellcheck(paths);
}

async function spellcheck(paths: string[] = []): Promise<void> {
  if (paths.length === 0) {
    paths = ['.'];
  }

  await execFromRoot([...resolveToolCommand({ tool: 'cspell' }), '--no-progress', '--no-must-find-files', { batchedArguments: paths }]);
}

await wrapCliTask(main);

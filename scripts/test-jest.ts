import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';

async function main(): Promise<void> {
  await execFromRoot('node --experimental-vm-modules node_modules/jest/bin/jest.js --no-cache');
}

await wrapCliTask(main);

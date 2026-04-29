import { execFromRoot } from './helpers/root.ts';

async function main(): Promise<void> {
  await execFromRoot('node --experimental-vm-modules node_modules/jest/bin/jest.js --no-cache');
}

await main();

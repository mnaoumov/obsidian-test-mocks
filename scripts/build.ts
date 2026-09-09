import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { getPackageManagerRunCommand } from './helpers/package-manager.ts';
import { execFromRoot } from './helpers/root.ts';

exitIfScriptDisabled();

const BUILD_STEPS = [
  'build:clean',
  'build:compile',
  'build:generate:indices',
  'build:lib',
  'build:types'
];

for (const step of BUILD_STEPS) {
  await execFromRoot([...getPackageManagerRunCommand(), step]);
}

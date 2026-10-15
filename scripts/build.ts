import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { getPackageManagerRunCommand } from '@mnaoumov/typescript-dev-toolkit/package-manager';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';

await wrapCliTask(async () => {
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
});

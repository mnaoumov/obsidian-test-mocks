import { execFromRoot } from './helpers/exec.ts';

const BUILD_STEPS = [
  'build:clean',
  'build:compile:typescript',
  'build:generate:indices',
  'build:lib'
];

for (const step of BUILD_STEPS) {
  await execFromRoot(['npm', 'run', step]);
}

import { execFromRoot } from './helpers/root.ts';

const BUILD_STEPS = [
  'build:clean',
  'build:compile:typescript',
  'build:generate:indices',
  'build:lib',
  'build:types'
];

for (const step of BUILD_STEPS) {
  await execFromRoot(['npm', 'run', step]);
}

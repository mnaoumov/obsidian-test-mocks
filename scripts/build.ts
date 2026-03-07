import { execSync } from 'node:child_process';

const steps = [
  'npm run build:clean',
  'npm run build:compile:typescript',
  'npm run build:types',
  'npm run build:lib',
];

for (const step of steps) {
  execSync(step, { stdio: 'inherit' });
}

import { execSync } from 'node:child_process';

const args = process.argv.slice(2).join(' ');
execSync(`vitest ${args}`, { stdio: 'inherit' });

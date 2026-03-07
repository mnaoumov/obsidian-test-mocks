import { execSync } from 'node:child_process';

const fix = process.argv.includes('--fix');
execSync(`eslint src/${fix ? ' --fix' : ''}`, { stdio: 'inherit' });

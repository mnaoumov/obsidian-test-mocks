import { execSync } from 'node:child_process';

execSync('dprint check', { stdio: 'inherit' });

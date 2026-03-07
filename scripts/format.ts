import { execSync } from 'node:child_process';

execSync('dprint fmt', { stdio: 'inherit' });

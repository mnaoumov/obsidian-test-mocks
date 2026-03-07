import { execSync } from 'node:child_process';

execSync('tsc --noEmit', { stdio: 'inherit' });

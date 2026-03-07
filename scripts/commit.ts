import { execSync } from 'node:child_process';

execSync('cz', { stdio: 'inherit' });

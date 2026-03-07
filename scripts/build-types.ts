import { execSync } from 'node:child_process';

execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });

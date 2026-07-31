import process from 'node:process';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { lint } from './helpers/eslint.ts';

exitIfScriptDisabled();

const [, , ...paths] = process.argv;

await lint({ paths, shouldFix: false });

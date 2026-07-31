import process from 'node:process';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { format } from './helpers/format.ts';

exitIfScriptDisabled();

const [, , ...paths] = process.argv;

await format({ paths, rewrite: true });

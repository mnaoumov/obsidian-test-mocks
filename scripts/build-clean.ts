import { rm } from 'node:fs/promises';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';

exitIfScriptDisabled();

await rm('dist', { force: true, recursive: true });

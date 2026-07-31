/**
 * @file
 *
 * Nano-staged configuration for pre-commit hooks.
 */

import process from 'node:process';

import {
  isEnvVariableOff,
  loadEnvFileIfExists
} from './helpers/env-toggle.ts';

const NANO_STAGED_ENV_VARIABLE = 'NANO_STAGED';

const tasks: Record<string, string[]> = {
  '*': [
    'npm run spellcheck --'
  ],
  '*.{ts,tsx,mts}': [
    'npm run lint:fix --',
    'npm run format --'
  ],
  '*.md': [
    'npm run lint:md:fix --'
  ]
};

/**
 * The nano-staged task configuration, resolved with a per-developer opt-out.
 *
 * Loads a gitignored `.env` if present, then — when `NANO_STAGED` is set to an off value (`0`, `false`,
 * `off`, or `no`) — prints a notice and exits the process successfully so the pre-commit checks are skipped.
 * This mirrors husky's own `HUSKY=0` switch, but scoped to the nano-staged step (so the commit-msg hook
 * still runs). Otherwise it resolves to {@link tasks}.
 *
 * `NANO_STAGED` is not an npm script, so it carries its own switch rather than the script-name-derived one
 * every npm script gets — but both share the same notion of an off value, via {@link isEnvVariableOff}.
 */
export const config = getNanoStagedConfig();

function getNanoStagedConfig(): Record<string, string[]> {
  loadEnvFileIfExists();

  if (isEnvVariableOff(NANO_STAGED_ENV_VARIABLE)) {
    process.stdout.write(`nano-staged: skipped (${NANO_STAGED_ENV_VARIABLE} is off).\n`);
    process.exit(0);
  }

  return tasks;
}

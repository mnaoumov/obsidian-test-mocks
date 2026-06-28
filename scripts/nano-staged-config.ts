/**
 * @file
 *
 * Nano-staged configuration for pre-commit hooks.
 */

import { existsSync } from 'node:fs';
import process from 'node:process';

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

const NANO_STAGED_OFF_VALUES: ReadonlySet<string> = new Set(['0', 'false', 'no', 'off']);

/**
 * The nano-staged task configuration, resolved with a per-developer opt-out.
 *
 * Loads a gitignored `.env` if present (via Node's own `process.loadEnvFile`, so it behaves the same
 * on every platform and shell), then — when `NANO_STAGED` is set to an off value (`0`, `false`, `off`,
 * or `no`) — prints a notice and exits the process successfully so the pre-commit checks are skipped.
 * This mirrors husky's own `HUSKY=0` switch, but scoped to the nano-staged step (so the commit-msg
 * hook still runs). Otherwise it resolves to {@link tasks}.
 */
export const config = getNanoStagedConfig();

function getNanoStagedConfig(): Record<string, string[]> {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  if (isNanoStagedDisabled(process.env['NANO_STAGED'])) {
    process.stdout.write('nano-staged: skipped (NANO_STAGED is off).\n');
    process.exit(0);
  }

  return tasks;
}

function isNanoStagedDisabled(value: string | undefined): boolean {
  return NANO_STAGED_OFF_VALUES.has((value ?? '').trim().toLowerCase());
}

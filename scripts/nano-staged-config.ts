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
import { getPackageManagerRunCommand } from './helpers/package-manager.ts';

/**
 * The `<manager> run` prefix every task below is built on, resolved once for the process.
 *
 * Detection is a handful of `existsSync` calls and at most one `package.json` read — no `.env` read and
 * no `process.exit`, which is what lets it sit at module scope beside the tasks it prefixes.
 */
const PACKAGE_MANAGER_RUN_COMMAND = getPackageManagerRunCommand().join(' ');

const NANO_STAGED_ENV_VARIABLE = 'NANO_STAGED';

const tasks: Record<string, string[]> = {
  '*': [
    `${PACKAGE_MANAGER_RUN_COMMAND} spellcheck --`
  ],
  '*.{ts,tsx,mts}': [
    `${PACKAGE_MANAGER_RUN_COMMAND} lint:fix --`,
    `${PACKAGE_MANAGER_RUN_COMMAND} format --`
  ],
  /*
   * Lint only, with no `format` step beside it: dprint loads a TypeScript, a JSON and a markdown plugin, and none
   * of them formats Astro. `lint` reaches the `docs/` components too, but no CI job runs it, so without this entry
   * a staged `.astro` change would be spellchecked and nothing else.
   */
  '*.astro': [
    `${PACKAGE_MANAGER_RUN_COMMAND} lint:fix --`
  ],
  '*.md': [
    `${PACKAGE_MANAGER_RUN_COMMAND} lint:md:fix --`
  ],
  /*
   * The vendored ESLint rule sources, which are hand-copies of `obsidian-dev-utils`' and are supposed to be
   * the same bytes. Running last is what makes this useful rather than merely present: `lint:fix` and
   * `format` above rewrite a staged copy in place, which is one of the three ways these files drift, so the
   * check has to read what is about to be committed rather than what was staged. The key sorts to last here
   * on its own — perfectionist puts a recursive glob after the single-segment ones — so that order is
   * enforced rather than merely typed in.
   *
   * It takes no filenames: the glob is only what decides whether it runs at all, so an ordinary commit
   * touching no vendored file fetches nothing.
   */
  '**/eslint-rules/*.ts': [
    `${PACKAGE_MANAGER_RUN_COMMAND} check:vendored-eslint-rules --`
  ],
  /*
   * The documentation pipeline, which is a hand-maintained copy of `obsidian-dev-utils`'. Same reasoning as
   * the entry above, and the same ordering requirement for a sharper reason: `scripts/docs-gen` is outside
   * dprint's scope but NOT outside ESLint's, so `lint:fix` above is the one thing here that rewrites a
   * staged file in this tree, and a shape measured before it ran would be a shape nobody commits.
   *
   * It takes no filenames either: the glob only decides whether it runs, so an ordinary commit touching no
   * file under `scripts/docs-gen` fetches nothing.
   */
  'scripts/docs-gen/**': [
    `${PACKAGE_MANAGER_RUN_COMMAND} check:docs-gen-copy-sync --`
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

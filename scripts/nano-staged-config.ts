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
  /*
   * The three single files this repo keeps in copy-sync with `obsidian-dev-utils` — the rest of the roster
   * is the two trees in the entry below, and `scripts/helpers/copy-sync.ts` holds all five as
   * `COPY_SYNC_PATHS`. Same subject as the vendored-rules entry further down, and the same limitation: this
   * wants to measure a shape AFTER `lint:fix` has rewritten whatever it is about to rewrite, and nano-staged
   * offers no way to ask for that (see that entry).
   *
   * Neither entry takes filenames: the glob only decides whether the check runs, so an ordinary commit
   * touching no copied file fetches nothing. A commit that stages files matching both entries runs the
   * check twice, which costs one extra tree call of the hourly 60 and is the price of nano-staged's
   * matcher — see the entry below.
   */
  '{.github/workflows/build-pages.yml,astro.config.ts,docs/tsconfig.json}': [
    `${PACKAGE_MANAGER_RUN_COMMAND} check:copy-sync --`
  ],
  /*
   * The two copy-sync trees, in one key. The brace has to sit BEFORE the `/**`: nano-staged treats `**` as
   * a globstar only when it is bounded by a `/` or the end of the pattern, so inside a brace group — as in
   * `{docs/src/**,scripts/docs-gen/**}` — it degrades to a single-segment wildcard and silently stops
   * matching `scripts/docs-gen/helpers/*`, which is most of the tree.
   */
  '{docs/src,scripts/docs-gen}/**': [
    `${PACKAGE_MANAGER_RUN_COMMAND} check:copy-sync --`
  ],
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
   * the same bytes. `lint:fix` and `format` elsewhere in this object rewrite a staged copy in place, which
   * is one of the three ways these files drift, so this check wants to read what is about to be committed
   * rather than what was staged — and where its key sits cannot buy that. **nano-staged builds one task
   * group per pattern and runs the groups with `Promise.all`** (measured against nano-staged 1.0.2,
   * 2026-09-19), so this group RACES `lint:fix` rather than following it; sequencing exists within a single
   * key's command list and nowhere else. Key order here is only what perfectionist sorts it to, and says
   * nothing about when anything runs.
   *
   * It takes no filenames: the glob is only what decides whether it runs at all, so an ordinary commit
   * touching no vendored file fetches nothing.
   */
  '**/eslint-rules/*.ts': [
    `${PACKAGE_MANAGER_RUN_COMMAND} check:vendored-eslint-rules --`
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

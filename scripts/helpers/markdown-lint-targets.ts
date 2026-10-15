/**
 * @file
 *
 * The markdown files `lint:md` checks when it is given none.
 *
 * `@mnaoumov/typescript-dev-toolkit`'s markdown `lint` hands every tracked `*.md` file to `linkinator`, the
 * documentation site's guides included. Those link to each other base-absolutely (`/obsidian-test-mocks/guides/...`),
 * which only resolves against the BUILT site, so `linkinator` reports every one of them as a 404. The guides are
 * link-checked against the built html by `docs:build` instead, and `docs/**` is outside markdownlint's scope
 * anyway, so they are left out here.
 */

import { getNonIgnoredFiles } from '@mnaoumov/typescript-dev-toolkit/git';
import { checkIsInNodeModules } from '@mnaoumov/typescript-dev-toolkit/linters/markdownlint-ignores';

const DOCS_SITE_PREFIX = 'docs/';

/**
 * Resolves the markdown files to lint.
 *
 * @param paths - The paths passed on the command line.
 * @returns `paths` when there are any, otherwise every tracked or untracked-but-not-ignored markdown file outside
 * the documentation site and `node_modules`.
 */
export async function getMarkdownLintTargets(paths: string[]): Promise<string[]> {
  if (paths.length > 0) {
    return paths;
  }

  const files = await getNonIgnoredFiles({ patterns: ['*.md'] });
  if (files === null) {
    throw new Error('Could not list the markdown files: this is not a git checkout.');
  }

  return files.filter((path) => !path.startsWith(DOCS_SITE_PREFIX) && !checkIsInNodeModules(path));
}

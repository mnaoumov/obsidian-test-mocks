/**
 * @file
 *
 * This repository's documentation site, shared by `astro.config.ts` and the `docs:*` scripts.
 */

import type { ImportStatementContext } from '@mnaoumov/typescript-dev-toolkit/docs-site/api-doc-settings';
import type { DocsSiteConfig } from '@mnaoumov/typescript-dev-toolkit/docs-site/docs-site-config';

const MOCK_ONLY_SUFFIX = '__';

// Cspell:disable -- URL fragments are not words
const EXTERNAL_TYPE_LINKS = new Map<string, string>([
  ['ChangeSpec', 'https://codemirror.net/docs/ref/#state.ChangeSpec'],
  ['CharCategory', 'https://codemirror.net/docs/ref/#state.CharCategory'],
  ['DecorationSet', 'https://codemirror.net/docs/ref/#view.DecorationSet'],
  ['Direction', 'https://codemirror.net/docs/ref/#view.Direction'],
  ['DOMEventHandlers', 'https://codemirror.net/docs/ref/#view.DOMEventHandlers'],
  ['EditorState', 'https://codemirror.net/docs/ref/#state.EditorState'],
  ['EditorView', 'https://codemirror.net/docs/ref/#view.EditorView'],
  ['Extension', 'https://codemirror.net/docs/ref/#state.Extension'],
  ['FacetReader', 'https://codemirror.net/docs/ref/#state.FacetReader'],
  ['Moment', 'https://momentjs.com/docs/#/parsing/'],
  ['MomentInput', 'https://momentjs.com/docs/#/parsing/'],
  ['RangeCursor', 'https://codemirror.net/docs/ref/#state.RangeCursor'],
  ['StateField', 'https://codemirror.net/docs/ref/#state.StateField'],
  ['Transaction', 'https://codemirror.net/docs/ref/#state.Transaction'],
  ['TurndownService', 'https://github.com/mixmark-io/turndown#readme']
]);
// Cspell:enable

export const DOCS_SITE_CONFIG: DocsSiteConfig = {
  apiIndexIntro: 'The `obsidian` modules are the mocks themselves, imported by name from `obsidian-test-mocks/obsidian`; '
    + 'the `globals` modules are installed as a side effect of importing a setup entry point.',
  excludedDirectories: ['internal', 'jest'],
  externalTypeLinks: EXTERNAL_TYPE_LINKS,
  importStatement: getImportStatement,
  memberRouteSegment: getMemberRouteSegment,
  repo: 'obsidian-test-mocks',
  title: 'Obsidian Test Mocks'
};

/**
 * The package publishes barrel entry points, not one subpath per module: a mock is imported by name from
 * `obsidian-test-mocks/obsidian`, and a `globals` module, which exports nothing by name, is installed as a side effect
 * of importing the setup entry point.
 *
 * @param context - The export.
 * @returns The import statement.
 */
function getImportStatement(context: ImportStatementContext): string {
  if (context.namespace.startsWith('globals/')) {
    return 'import \'obsidian-test-mocks/setup\';';
  }

  const importKeyword = context.isTypeOnly ? 'import type' : 'import';
  return `${importKeyword} { ${context.name} } from 'obsidian-test-mocks/obsidian';`;
}

/**
 * Keeps the routes the site has always had for mock-only members: `create__` is served at `create-mock`.
 *
 * @param name - A property's name or a method's overload key.
 * @returns The route segment, or `undefined` for the generator's own.
 */
function getMemberRouteSegment(name: string): string | undefined {
  return name.endsWith(MOCK_ONLY_SUFFIX) ? `${name.slice(0, -MOCK_ONLY_SUFFIX.length)}-mock` : undefined;
}

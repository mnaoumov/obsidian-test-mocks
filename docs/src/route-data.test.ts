/**
 * @file
 *
 * Regression coverage for documentation social-metadata URLs.
 */

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { onRequest } from './route-data.ts';

describe('onRequest', () => {
  it('adds case-preserved Open Graph and Twitter URLs', () => {
    vi.stubEnv('BASE_URL', '/obsidian-test-mocks/');
    const head: unknown[] = [];
    const context = {
      locals: {
        starlightRoute: {
          head,
          id: 'api/abort-controller/abortSignalAny/index'
        }
      },
      url: new URL('https://mnaoumov.dev/obsidian-test-mocks/api/abort-controller/abortSignalAny/')
    };

    onRequest(context as Parameters<typeof onRequest>[0]);

    expect(head).toEqual([
      { attrs: { content: 'https://mnaoumov.dev/obsidian-test-mocks/og/api/abort-controller/abortSignalAny.png', property: 'og:image' }, tag: 'meta' },
      { attrs: { content: '1200', property: 'og:image:width' }, tag: 'meta' },
      { attrs: { content: '630', property: 'og:image:height' }, tag: 'meta' },
      { attrs: { content: 'https://mnaoumov.dev/obsidian-test-mocks/og/api/abort-controller/abortSignalAny.png', name: 'twitter:image' }, tag: 'meta' }
    ]);
  });

  it('falls back to the index image when the slug is empty (root page)', () => {
    vi.stubEnv('BASE_URL', '/obsidian-test-mocks/');
    const head: unknown[] = [];
    const context = {
      locals: {
        starlightRoute: {
          head,
          id: ''
        }
      },
      url: new URL('https://mnaoumov.dev/obsidian-test-mocks/')
    };

    onRequest(context as Parameters<typeof onRequest>[0]);

    expect(head).toEqual([
      { attrs: { content: 'https://mnaoumov.dev/obsidian-test-mocks/og/index.png', property: 'og:image' }, tag: 'meta' },
      { attrs: { content: '1200', property: 'og:image:width' }, tag: 'meta' },
      { attrs: { content: '630', property: 'og:image:height' }, tag: 'meta' },
      { attrs: { content: 'https://mnaoumov.dev/obsidian-test-mocks/og/index.png', name: 'twitter:image' }, tag: 'meta' }
    ]);
  });
});

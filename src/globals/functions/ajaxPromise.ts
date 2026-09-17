/**
 * @file
 *
 * Mock of Obsidian's global `ajaxPromise` helper.
 */

import type { AjaxOptions } from '../../internal/types.ts';

import { noopAsync } from '../../internal/noop.ts';

/**
 * Sends an HTTP request through `XMLHttpRequest`, as `ajax` does, and resolves with the response. The mock sends
 * nothing.
 *
 * @param _options - The request's URL, method, data, headers and callbacks. Ignored by the mock.
 * @returns A promise that resolves to `undefined` in the mock.
 */
// eslint-disable-next-line obsidian-dev-utils/params-options-name-match -- `AjaxOptions` is Obsidian's own name for this shape, shared with the global `ajax`. See the matching note there.
export async function ajaxPromise(_options: AjaxOptions): Promise<unknown> {
  await noopAsync();
  return undefined;
}

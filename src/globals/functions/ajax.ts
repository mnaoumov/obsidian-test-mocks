/**
 * @file
 *
 * Mock of Obsidian's global `ajax` helper.
 */

import type { AjaxOptions } from '../../internal/types.ts';

import { noop } from '../../internal/noop.ts';

/**
 * Sends an HTTP request through `XMLHttpRequest`, reporting the outcome through the `success` and `error` callbacks.
 * A no-op in the mock: no request is sent and neither callback is called.
 *
 * @param _options - The request's URL, method, data, headers and callbacks. Ignored by the mock.
 */
// eslint-disable-next-line obsidian-dev-utils/params-options-name-match -- `AjaxOptions` is Obsidian's own name for this shape, shared by the global `ajax` and `ajaxPromise`. Renaming it per-function would break the 1:1 mapping to the API being mocked, and the two functions want different prefixes for the same type.
export function ajax(_options: AjaxOptions): void {
  noop();
}

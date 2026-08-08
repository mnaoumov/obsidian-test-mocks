import type { AjaxOptions } from '../../internal/types.ts';

import { noop } from '../../internal/noop.ts';

// eslint-disable-next-line obsidian-dev-utils/params-options-name-match -- `AjaxOptions` is Obsidian's own name for this shape, shared by the global `ajax` and `ajaxPromise`. Renaming it per-function would break the 1:1 mapping to the API being mocked, and the two functions want different prefixes for the same type.
export function ajax(_options: AjaxOptions): void {
  noop();
}

import type { AjaxOptions } from '../../internal/types.ts';

import { noopAsync } from '../../internal/noop.ts';

// eslint-disable-next-line obsidian-dev-utils/params-options-name-match -- `AjaxOptions` is Obsidian's own name for this shape, shared with the global `ajax`. See the matching note there.
export async function ajaxPromise(_options: AjaxOptions): Promise<unknown> {
  await noopAsync();
  return undefined;
}

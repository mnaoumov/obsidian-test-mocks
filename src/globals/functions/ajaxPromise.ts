import type { AjaxOptions } from '../../internal/types.ts';

import { noopAsync } from '../../internal/noop.ts';

export async function ajaxPromise(_options: AjaxOptions): Promise<unknown> {
  await noopAsync();
  return undefined;
}

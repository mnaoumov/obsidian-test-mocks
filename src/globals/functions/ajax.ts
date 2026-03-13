import type { AjaxOptions } from '../../internal/types.ts';

import { noop } from '../../internal/noop.ts';

export function ajax(_options: AjaxOptions): void {
  noop();
}

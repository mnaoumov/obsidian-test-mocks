import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
    const self = strictProxy(this);
    self.constructor__(_menu);
    return self;
  }

  public static create__(menu: Menu): MenuSeparator {
    return new MenuSeparator(menu);
  }

  public static fromOriginalType__(value: MenuSeparatorOriginal): MenuSeparator {
    return bridgeType<MenuSeparator>(value);
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return bridgeType<MenuSeparatorOriginal>(this);
  }

  public constructor__(_menu: Menu): void {
    noop();
  }
}

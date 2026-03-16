import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
    const self = strictProxyForce(this);
    self.constructor__(_menu);
    return self;
  }

  public static create__(menu: Menu): MenuSeparator {
    return new MenuSeparator(menu);
  }

  public static fromOriginalType__(value: MenuSeparatorOriginal): MenuSeparator {
    return strictProxyForce(value, MenuSeparator);
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return strictProxyForce<MenuSeparatorOriginal>(this);
  }

  public constructor__(_menu: Menu): void {
    noop();
  }
}

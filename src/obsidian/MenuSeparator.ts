import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
    const self = createMockOfUnsafe(this);
    self.constructor__(_menu);
    return self;
  }

  public static create__(menu: Menu): MenuSeparator {
    return new MenuSeparator(menu);
  }

  public static fromOriginalType__(value: MenuSeparatorOriginal): MenuSeparator {
    return createMockOfUnsafe<MenuSeparator>(value);
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return createMockOfUnsafe<MenuSeparatorOriginal>(this);
  }

  public constructor__(_menu: Menu): void {
    noop();
  }
}

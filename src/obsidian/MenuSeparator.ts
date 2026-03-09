import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
    const mock = strictMock(this);
    MenuSeparator.constructor__(mock, _menu);
    return mock;
  }

  public static constructor__(_instance: MenuSeparator, _menu: Menu): void {
    // Spy hook.
  }

  public static create__(_menu: Menu): MenuSeparator {
    return new MenuSeparator(_menu);
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return castTo<MenuSeparatorOriginal>(this);
  }
}

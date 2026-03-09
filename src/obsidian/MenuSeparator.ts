import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
    noop();
  }

  public static create__(menu: Menu): MenuSeparator {
    return strictMock(new MenuSeparator(menu));
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return castTo<MenuSeparatorOriginal>(this);
  }
}

import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class MenuSeparator {
  protected constructor(_menu: Menu) {
  }

  public static create__(_menu: Menu): MenuSeparator {
    return strictMock(new MenuSeparator(_menu));
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return castTo<MenuSeparatorOriginal>(this);
  }
}

import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import type { Menu } from './Menu.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class MenuSeparator {
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Protected constructor for create__() factory pattern.
  protected constructor(_menu: Menu) {
  }

  public static create__(menu: Menu): MenuSeparator {
    return strictMock(new MenuSeparator(menu));
  }

  public asOriginalType__(): MenuSeparatorOriginal {
    return castTo<MenuSeparatorOriginal>(this);
  }
}

import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';

export class MenuSeparator {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public asOriginalType__(): MenuSeparatorOriginal {
    return castTo<MenuSeparatorOriginal>(this);
  }
}

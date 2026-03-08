import { castTo } from '../internal/Cast.ts';
import type { MenuSeparator as RealMenuSeparator } from 'obsidian';

export class MenuSeparator {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public asReal__(): RealMenuSeparator {
    return castTo<RealMenuSeparator>(this);
  }
}

import type { MenuSeparator as RealMenuSeparator } from 'obsidian';
import { strictCastTo } from '../internal/StrictMock.ts';

export class MenuSeparator {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public asReal__(): RealMenuSeparator {
    return strictCastTo<RealMenuSeparator>(this);
  }
}

import type { IconValue as RealIconValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealIconValue {
    return strictCastTo<RealIconValue>(this);
  }
}

import { castTo } from '../internal/Cast.ts';
import type { IconValue as RealIconValue } from 'obsidian';

import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealIconValue {
    return castTo<RealIconValue>(this);
  }
}

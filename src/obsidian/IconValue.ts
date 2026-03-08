import type { IconValue as IconValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): IconValueOriginal {
    return castTo<IconValueOriginal>(this);
  }
}

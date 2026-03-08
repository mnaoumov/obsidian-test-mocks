import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): HTMLValueOriginal {
    return castTo<HTMLValueOriginal>(this);
  }
}

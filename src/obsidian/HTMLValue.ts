import { castTo } from '../internal/Cast.ts';
import type { HTMLValue as RealHTMLValue } from 'obsidian';

import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealHTMLValue {
    return castTo<RealHTMLValue>(this);
  }
}

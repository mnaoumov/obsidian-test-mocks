import { castTo } from '../internal/Cast.ts';
import type { RelativeDateValue as RealRelativeDateValue } from 'obsidian';

import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealRelativeDateValue {
    return castTo<RealRelativeDateValue>(this);
  }
}

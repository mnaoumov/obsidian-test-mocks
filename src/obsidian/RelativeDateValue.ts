import type { RelativeDateValue as RealRelativeDateValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealRelativeDateValue {
    return strictCastTo<RealRelativeDateValue>(this);
  }
}

import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): RelativeDateValueOriginal {
    return castTo<RelativeDateValueOriginal>(this);
  }
}

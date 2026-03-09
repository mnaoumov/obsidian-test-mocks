import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public static override create__(): RelativeDateValue {
    return strictMock(new RelativeDateValue());
  }

  public override asOriginalType__(): RelativeDateValueOriginal {
    return castTo<RelativeDateValueOriginal>(this);
  }
}

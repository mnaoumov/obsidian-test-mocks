import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor4__();
    return self;
  }

  public static override create__(): RelativeDateValue {
    return new RelativeDateValue();
  }

  public override asOriginalType__(): RelativeDateValueOriginal {
    return castTo<RelativeDateValueOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}

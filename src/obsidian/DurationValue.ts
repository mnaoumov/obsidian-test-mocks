import type { DurationValue as DurationValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public static create__(): DurationValue {
    return strictMock(new DurationValue());
  }

  public override asOriginalType__(): DurationValueOriginal {
    return castTo<DurationValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

import type { DurationValue as RealDurationValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealDurationValue {
    return strictCastTo<RealDurationValue>(this);
  }
}

import { castTo } from '../internal/Cast.ts';
import type { DurationValue as RealDurationValue } from 'obsidian';

import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealDurationValue {
    return castTo<RealDurationValue>(this);
  }
}

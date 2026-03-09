import type { DurationValue as DurationValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public override asOriginalType__(): DurationValueOriginal {
    return castTo<DurationValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}

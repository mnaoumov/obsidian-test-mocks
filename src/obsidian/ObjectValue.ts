import { castTo } from '../internal/Cast.ts';
import type { ObjectValue as RealObjectValue } from 'obsidian';

import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealObjectValue {
    return castTo<RealObjectValue>(this);
  }
}

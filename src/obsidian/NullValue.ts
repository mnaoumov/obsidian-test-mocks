import type { NullValue as RealNullValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public isTruthy__(): boolean {
    return false;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealNullValue {
    return strictCastTo<RealNullValue>(this);
  }
}

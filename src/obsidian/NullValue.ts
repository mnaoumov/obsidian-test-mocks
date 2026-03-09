import type { NullValue as NullValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public static create__(): NullValue {
    return strictMock(new NullValue());
  }

  public override asOriginalType__(): NullValueOriginal {
    return castTo<NullValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return false;
  }

  public toString(): string {
    return '';
  }
}

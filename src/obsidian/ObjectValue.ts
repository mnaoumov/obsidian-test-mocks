import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public static create__(): ObjectValue {
    return strictMock(new ObjectValue());
  }

  public override asOriginalType__(): ObjectValueOriginal {
    return castTo<ObjectValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

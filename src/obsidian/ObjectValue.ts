import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor3__();
    return self;
  }

  public static create__(): ObjectValue {
    return new ObjectValue();
  }

  public override asOriginalType__(): ObjectValueOriginal {
    return castTo<ObjectValueOriginal>(this);
  }

  public constructor3__(): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

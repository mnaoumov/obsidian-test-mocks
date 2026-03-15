import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public constructor(data: unknown) {
    super();
    const self = strictMock(this);
    self.constructor3__(data);
    return self;
  }

  public static create__(data: unknown): ObjectValue {
    return new ObjectValue(data);
  }

  public static override fromOriginalType__(value: ObjectValueOriginal): ObjectValue {
    return castTo<ObjectValue>(value);
  }

  public override asOriginalType__(): ObjectValueOriginal {
    return castTo<ObjectValueOriginal>(this);
  }

  public constructor3__(_data: unknown): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

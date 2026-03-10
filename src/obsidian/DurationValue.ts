import type { DurationValue as DurationValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor3__();
    return self;
  }

  public static create__(): DurationValue {
    return new DurationValue();
  }

  public override asOriginalType__(): DurationValueOriginal {
    return castTo<DurationValueOriginal>(this);
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

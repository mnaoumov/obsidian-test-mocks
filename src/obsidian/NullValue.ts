import type { NullValue as NullValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public static create__(): NullValue {
    return new NullValue();
  }

  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return castTo<NullValue>(value);
  }

  public asOriginalType2__(): NullValueOriginal {
    return castTo<NullValueOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }

  public isTruthy(): boolean {
    return false;
  }

  public toString(): string {
    return '';
  }
}

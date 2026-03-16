import type { NullValue as NullValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public constructor() {
    super();
    const self = createMockOfUnsafe(this);
    self.constructor2__();
    return self;
  }

  public static create__(): NullValue {
    return new NullValue();
  }

  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return createMockOfUnsafe<NullValue>(value);
  }

  public asOriginalType2__(): NullValueOriginal {
    return createMockOfUnsafe<NullValueOriginal>(this);
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

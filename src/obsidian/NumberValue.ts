import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value = 0) {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = 0): NumberValue {
    return new NumberValue(value);
  }

  public static fromOriginalType4__(value: NumberValueOriginal): NumberValue {
    return strictProxy(value, NumberValue);
  }

  public asOriginalType4__(): NumberValueOriginal {
    return strictProxy<NumberValueOriginal>(this);
  }

  public constructor4__(_value = 0): void {
    noop();
  }
}

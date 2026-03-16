import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = false): BooleanValue {
    return new BooleanValue(value);
  }

  public static fromOriginalType4__(value: BooleanValueOriginal): BooleanValue {
    return bridgeType<BooleanValue>(value);
  }

  public asOriginalType4__(): BooleanValueOriginal {
    return bridgeType<BooleanValueOriginal>(this);
  }

  public constructor4__(_value = false): void {
    noop();
  }
}

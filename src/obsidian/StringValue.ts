import type { StringValue as StringValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = ''): StringValue {
    return new StringValue(value);
  }

  public static fromOriginalType4__(value: StringValueOriginal): StringValue {
    return strictProxy(value, StringValue);
  }

  public asOriginalType4__(): StringValueOriginal {
    return strictProxy<StringValueOriginal>(this);
  }

  public constructor4__(_value = ''): void {
    noop();
  }
}

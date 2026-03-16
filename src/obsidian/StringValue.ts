import type { StringValue as StringValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
    const self = strictProxyForce(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = ''): StringValue {
    return new StringValue(value);
  }

  public static fromOriginalType4__(value: StringValueOriginal): StringValue {
    return strictProxyForce(value, StringValue);
  }

  public asOriginalType4__(): StringValueOriginal {
    return strictProxyForce<StringValueOriginal>(this);
  }

  public constructor4__(_value = ''): void {
    noop();
  }
}

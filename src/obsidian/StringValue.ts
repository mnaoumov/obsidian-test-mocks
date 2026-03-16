import type { StringValue as StringValueOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
    const self = createMockOf(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = ''): StringValue {
    return new StringValue(value);
  }

  public static fromOriginalType4__(value: StringValueOriginal): StringValue {
    return createMockOfUnsafe<StringValue>(value);
  }

  public asOriginalType4__(): StringValueOriginal {
    return createMockOfUnsafe<StringValueOriginal>(this);
  }

  public constructor4__(_value = ''): void {
    noop();
  }
}

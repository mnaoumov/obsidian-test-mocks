import type { IconValue as IconValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = createMockOfUnsafe(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): IconValue {
    return new IconValue(value);
  }

  public static fromOriginalType5__(value: IconValueOriginal): IconValue {
    return createMockOfUnsafe<IconValue>(value);
  }

  public asOriginalType5__(): IconValueOriginal {
    return createMockOfUnsafe<IconValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

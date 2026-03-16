import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = createMockOf(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): HTMLValue {
    return new HTMLValue(value);
  }

  public static fromOriginalType5__(value: HTMLValueOriginal): HTMLValue {
    return createMockOfUnsafe<HTMLValue>(value);
  }

  public asOriginalType5__(): HTMLValueOriginal {
    return createMockOfUnsafe<HTMLValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

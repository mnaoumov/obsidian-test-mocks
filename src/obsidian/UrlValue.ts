import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  public constructor(value: string, display?: null | string) {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value, display);
    return self;
  }

  public static create2__(value: string, display?: null | string): UrlValue {
    return new UrlValue(value, display);
  }

  public static fromOriginalType5__(value: UrlValueOriginal): UrlValue {
    return createMockOfUnsafe<UrlValue>(value);
  }

  public asOriginalType5__(): UrlValueOriginal {
    return createMockOfUnsafe<UrlValueOriginal>(this);
  }

  public constructor5__(_value: string, _display?: null | string): void {
    noop();
  }
}

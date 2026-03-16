import type { ImageValue as ImageValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class ImageValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): ImageValue {
    return new ImageValue(value);
  }

  public static fromOriginalType5__(value: ImageValueOriginal): ImageValue {
    return createMockOfUnsafe<ImageValue>(value);
  }

  public asOriginalType5__(): ImageValueOriginal {
    return createMockOfUnsafe<ImageValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

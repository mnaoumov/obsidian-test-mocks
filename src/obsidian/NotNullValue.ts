import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Value } from './Value.ts';

export abstract class NotNullValue extends Value {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public static fromOriginalType2__(value: NotNullValueOriginal): NotNullValue {
    return createMockOfUnsafe<NotNullValue>(value);
  }

  public asOriginalType2__(): NotNullValueOriginal {
    return createMockOfUnsafe<NotNullValueOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }
}

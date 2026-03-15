import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
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

  public static override fromOriginalType__(value: NotNullValueOriginal): NotNullValue {
    return castTo<NotNullValue>(value);
  }

  public override asOriginalType__(): NotNullValueOriginal {
    return castTo<NotNullValueOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }
}

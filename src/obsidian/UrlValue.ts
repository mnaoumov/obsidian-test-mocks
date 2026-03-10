import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static override create__(value = ''): UrlValue {
    return new UrlValue(value);
  }

  public override asOriginalType__(): UrlValueOriginal {
    return castTo<UrlValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

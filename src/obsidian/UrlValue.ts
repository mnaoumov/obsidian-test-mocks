import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  public static override create__(value = ''): UrlValue {
    return strictMock(new UrlValue(value));
  }

  public override asOriginalType__(): UrlValueOriginal {
    return castTo<UrlValueOriginal>(this);
  }
}

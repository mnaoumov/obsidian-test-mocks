import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  public static override create__(value = ''): HTMLValue {
    return strictMock(new HTMLValue(value));
  }

  public override asOriginalType__(): HTMLValueOriginal {
    return castTo<HTMLValueOriginal>(this);
  }
}

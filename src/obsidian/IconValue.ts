import type { IconValue as IconValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  public static override create__(value = ''): IconValue {
    return strictMock(new IconValue(value));
  }

  public override asOriginalType__(): IconValueOriginal {
    return castTo<IconValueOriginal>(this);
  }
}

import type { TagValue as TagValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
  }

  public static override create__(value: string): TagValue {
    return strictMock(new TagValue(value));
  }

  public override asOriginalType__(): TagValueOriginal {
    return castTo<TagValueOriginal>(this);
  }
}

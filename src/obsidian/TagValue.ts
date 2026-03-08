import type { TagValue as TagValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
  }

  public override asOriginalType__(): TagValueOriginal {
    return castTo<TagValueOriginal>(this);
  }
}

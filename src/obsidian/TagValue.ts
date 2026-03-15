import type { TagValue as TagValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value: string): TagValue {
    return new TagValue(value);
  }

  public static fromOriginalType3__(value: TagValueOriginal): TagValue {
    return castTo<TagValue>(value);
  }

  public override asOriginalType__(): TagValueOriginal {
    return castTo<TagValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

import type { TagValue as TagValueOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
    const self = createMockOf(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value: string): TagValue {
    return new TagValue(value);
  }

  public static fromOriginalType5__(value: TagValueOriginal): TagValue {
    return createMockOfUnsafe<TagValue>(value);
  }

  public asOriginalType5__(): TagValueOriginal {
    return createMockOfUnsafe<TagValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

import type { TagValue as TagValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value: string): TagValue {
    return new TagValue(value);
  }

  public static fromOriginalType5__(value: TagValueOriginal): TagValue {
    return bridgeType<TagValue>(value);
  }

  public asOriginalType5__(): TagValueOriginal {
    return bridgeType<TagValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

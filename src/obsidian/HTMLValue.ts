import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): HTMLValue {
    return new HTMLValue(value);
  }

  public static fromOriginalType5__(value: HTMLValueOriginal): HTMLValue {
    return bridgeType<HTMLValue>(value);
  }

  public asOriginalType5__(): HTMLValueOriginal {
    return bridgeType<HTMLValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

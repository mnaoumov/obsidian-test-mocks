import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  public constructor(value: string, display?: null | string) {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(value, display);
    return self;
  }

  public static create2__(value: string, display?: null | string): UrlValue {
    return new UrlValue(value, display);
  }

  public static fromOriginalType5__(value: UrlValueOriginal): UrlValue {
    return bridgeType<UrlValue>(value);
  }

  public asOriginalType5__(): UrlValueOriginal {
    return bridgeType<UrlValueOriginal>(this);
  }

  public constructor5__(_value: string, _display?: null | string): void {
    noop();
  }
}

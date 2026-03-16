import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictProxyForce(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): HTMLValue {
    return new HTMLValue(value);
  }

  public static fromOriginalType5__(value: HTMLValueOriginal): HTMLValue {
    return mergePrototype(HTMLValue, value);
  }

  public asOriginalType5__(): HTMLValueOriginal {
    return strictProxyForce<HTMLValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

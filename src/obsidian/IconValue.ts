import type { IconValue as IconValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictProxyForce(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): IconValue {
    return new IconValue(value);
  }

  public static fromOriginalType5__(value: IconValueOriginal): IconValue {
    return strictProxyForce(value, IconValue);
  }

  public asOriginalType5__(): IconValueOriginal {
    return strictProxyForce<IconValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

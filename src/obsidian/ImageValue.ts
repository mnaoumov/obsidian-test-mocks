import type { ImageValue as ImageValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { StringValue } from './StringValue.ts';

export class ImageValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictProxyForce(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): ImageValue {
    return new ImageValue(value);
  }

  public static fromOriginalType5__(value: ImageValueOriginal): ImageValue {
    return mergePrototype(ImageValue, value);
  }

  public asOriginalType5__(): ImageValueOriginal {
    return strictProxyForce<ImageValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}

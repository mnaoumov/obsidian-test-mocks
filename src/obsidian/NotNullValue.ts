import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

export abstract class NotNullValue extends Value {
  public constructor() {
    super();
    const self = strictProxyForce(this);
    self.constructor2__();
    return self;
  }

  public static fromOriginalType2__(value: NotNullValueOriginal): NotNullValue {
    return mergePrototype(NotNullValue, value);
  }

  public asOriginalType2__(): NotNullValueOriginal {
    return strictProxyForce<NotNullValueOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }
}

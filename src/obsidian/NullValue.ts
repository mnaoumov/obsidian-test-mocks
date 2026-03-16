import type { NullValue as NullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public constructor() {
    super();
    const self = strictProxyForce(this);
    self.constructor2__();
    return self;
  }

  public static create__(): NullValue {
    return new NullValue();
  }

  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return strictProxyForce(value, NullValue);
  }

  public asOriginalType2__(): NullValueOriginal {
    return strictProxyForce<NullValueOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }

  public isTruthy(): boolean {
    return false;
  }

  public toString(): string {
    return '';
  }
}

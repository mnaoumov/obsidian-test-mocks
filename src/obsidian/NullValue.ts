import type { NullValue as NullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public constructor() {
    super();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  public static create__(): NullValue {
    return new NullValue();
  }

  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return strictProxy(value, NullValue);
  }

  public asOriginalType2__(): NullValueOriginal {
    return strictProxy<NullValueOriginal>(this);
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

import type { NullValue as NullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
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
    return bridgeType<NullValue>(value);
  }

  public asOriginalType2__(): NullValueOriginal {
    return bridgeType<NullValueOriginal>(this);
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

import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

export abstract class PrimitiveValue<T> extends NotNullValue {
  public value__: T;

  public constructor(value: T) {
    super();
    this.value__ = value;
    const self = strictProxyForce(this);
    self.constructor3__(value);
    return self;
  }

  public static fromOriginalType3__<T>(value: PrimitiveValueOriginal<T>): PrimitiveValue<T> {
    return strictProxyForce<PrimitiveValue<T>>(value);
  }

  public asOriginalType3__(): PrimitiveValueOriginal<T> {
    return strictProxyForce<PrimitiveValueOriginal<T>>(this);
  }

  public constructor3__(_value: T): void {
    noop();
  }

  public isTruthy(): boolean {
    return !!this.value__;
  }

  public toString(): string {
    return String(this.value__);
  }
}

import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export abstract class PrimitiveValue<T> extends NotNullValue {
  public value__: T;

  public constructor(value: T) {
    super();
    this.value__ = value;
  }

  public override asOriginalType__(): PrimitiveValueOriginal<T> {
    return castTo<PrimitiveValueOriginal<T>>(this);
  }

  public isTruthy(): boolean {
    return !!this.value__;
  }

  public toString(): string {
    return String(this.value__);
  }
}

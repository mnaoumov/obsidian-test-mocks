import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export abstract class PrimitiveValue<T> extends NotNullValue {
  public value: T;

  public constructor(value: T) {
    super();
    this.value = value;
  }

  public override asOriginalType__(): PrimitiveValueOriginal<T> {
    return castTo<PrimitiveValueOriginal<T>>(this);
  }

  public isTruthy__(): boolean {
    return !!this.value;
  }

  public toString__(): string {
    return String(this.value);
  }
}

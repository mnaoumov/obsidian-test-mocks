import type { PrimitiveValue as RealPrimitiveValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { NotNullValue } from './NotNullValue.ts';

export abstract class PrimitiveValue<T> extends NotNullValue {
  public value: T;

  public constructor(value: T) {
    super();
    this.value = value;
  }

  public isTruthy__(): boolean {
    return !!this.value;
  }

  public toString__(): string {
    return String(this.value);
  }

  public override asReal__(): RealPrimitiveValue<T> {
    return strictCastTo<RealPrimitiveValue<T>>(this);
  }
}

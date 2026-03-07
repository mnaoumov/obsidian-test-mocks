import { NotNullValue } from './NotNullValue.ts';

export abstract class PrimitiveValue<T> extends NotNullValue {
  public abstract value: T;
}

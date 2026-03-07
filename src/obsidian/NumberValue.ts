import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public value: number = 0;

  public isTruthy(): boolean {
    return this.value !== 0;
  }

  public toString(): string {
    return String(this.value);
  }
}

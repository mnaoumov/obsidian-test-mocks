import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public value: boolean = false;

  public isTruthy(): boolean {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}

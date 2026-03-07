import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public value: string = '';

  public isTruthy(): boolean {
    return this.value.length > 0;
  }

  public toString(): string {
    return this.value;
  }
}

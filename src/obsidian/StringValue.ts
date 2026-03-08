import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
  }
}

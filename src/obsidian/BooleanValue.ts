import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
  }
}

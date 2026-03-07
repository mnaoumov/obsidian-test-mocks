import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

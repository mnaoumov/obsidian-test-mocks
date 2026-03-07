import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

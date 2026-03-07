import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

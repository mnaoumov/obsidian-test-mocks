import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

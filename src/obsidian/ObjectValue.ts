import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}

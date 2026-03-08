import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}

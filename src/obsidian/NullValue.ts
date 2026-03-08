import { Value } from './Value.ts';

export class NullValue extends Value {
  public isTruthy__(): boolean {
    return false;
  }

  public toString__(): string {
    return '';
  }
}

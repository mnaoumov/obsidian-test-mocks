import { Value } from './Value.ts';

export class NullValue extends Value {
  public isTruthy(): boolean {
    return false;
  }

  public toString(): string {
    return '';
  }
}

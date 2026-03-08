import type { Value } from './Value.ts';

import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values: Value[] = [];

  public isTruthy__(): boolean {
    return this.values.length > 0;
  }

  public toString__(): string {
    return this.values.map((v) => v.toString()).join(', ');
  }
}

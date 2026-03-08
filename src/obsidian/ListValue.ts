import type { ListValue as RealListValue } from 'obsidian';

import type { Value } from './Value.ts';

import { strictCastTo } from '../internal/StrictMock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values: Value[] = [];

  public isTruthy__(): boolean {
    return this.values.length > 0;
  }

  public toString__(): string {
    return this.values.map((v) => v.toString()).join(', ');
  }

  public override asReal__(): RealListValue {
    return strictCastTo<RealListValue>(this);
  }
}

import type { ListValue as ListValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { castTo } from '../internal/Cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values: Value[] = [];

  public override asOriginalType__(): ListValueOriginal {
    return castTo<ListValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return this.values.length > 0;
  }

  public toString__(): string {
    return this.values.map((v) => v.toString()).join(', ');
  }
}

import type { ListValue as ListValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values__: Value[] = [];

  public static create__(): ListValue {
    return strictMock(new ListValue());
  }

  public override asOriginalType__(): ListValueOriginal {
    return castTo<ListValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return this.values__.length > 0;
  }

  public toString(): string {
    return this.values__.map((v) => v.toString()).join(', ');
  }
}

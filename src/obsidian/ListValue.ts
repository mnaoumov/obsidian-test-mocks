import type { ListValue as ListValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values__: Value[] = [];

  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor3__();
    return self;
  }

  public static create__(): ListValue {
    return new ListValue();
  }

  public override asOriginalType__(): ListValueOriginal {
    return castTo<ListValueOriginal>(this);
  }

  public constructor3__(): void {
    noop();
  }

  public isTruthy(): boolean {
    return this.values__.length > 0;
  }

  public toString(): string {
    return this.values__.map((v) => v.toString()).join(', ');
  }
}

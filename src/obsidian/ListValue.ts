import type { ListValue as ListValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ListValue extends NotNullValue {
  public values__: Value[] = [];

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor(value: (unknown | Value)[]) {
    super();
    const self = strictProxyForce(this);
    self.constructor3__(value);
    return self;
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public static create__(value: (unknown | Value)[]): ListValue {
    return new ListValue(value);
  }

  public static fromOriginalType3__(value: ListValueOriginal): ListValue {
    return strictProxyForce(value, ListValue);
  }

  public asOriginalType3__(): ListValueOriginal {
    return strictProxyForce<ListValueOriginal>(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor3__(_value: (unknown | Value)[]): void {
    noop();
  }

  public isTruthy(): boolean {
    return this.values__.length > 0;
  }

  public toString(): string {
    return this.values__.map((v) => v.toString()).join(', ');
  }
}

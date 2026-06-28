import type {
  ObjectValue as ObjectValueOriginal,
  Value as ValueOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public constructor(private readonly data: unknown) {
    super();
    const self = strictProxy(this);
    self.constructor3__(data);
    return self;
  }

  public static create__(data: unknown): ObjectValue {
    return new ObjectValue(data);
  }

  public static fromOriginalType3__(value: ObjectValueOriginal): ObjectValue {
    return strictProxy(value, ObjectValue);
  }

  public asOriginalType3__(): ObjectValueOriginal {
    return strictProxy<ObjectValueOriginal>(this);
  }

  public constructor3__(_data: unknown): void {
    noop();
  }

  public get(_key: string): null | ValueOriginal {
    return null;
  }

  public isEmpty(): boolean {
    if (typeof this.data !== 'object' || this.data === null) {
      return true;
    }
    return Object.keys(this.data).length === 0;
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}

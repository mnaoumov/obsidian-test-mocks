import type { Value as ValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export abstract class Value {
  public static type: string;

  public constructor() {
    const self = strictMock(this);
    self.constructor__();
    return self;
  }

  public static equals(a: null | Value, b: null | Value): boolean {
    if (a === null || b === null) {
      return a === b;
    }
    return a.equals(b);
  }

  public static fromOriginalType__(value: ValueOriginal): Value {
    return createMockOfUnsafe<Value>(value);
  }

  public static looseEquals(a: null | Value, b: null | Value): boolean {
    if (a === null || b === null) {
      return a === b;
    }
    return a.looseEquals(b);
  }

  public asOriginalType__(): ValueOriginal {
    return createMockOfUnsafe<ValueOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public equals(other: this): boolean {
    return this.toString() === other.toString();
  }

  public abstract isTruthy(): boolean;

  public looseEquals(other: Value): boolean {
    return this.toString() === other.toString();
  }

  public renderTo(_el: HTMLElement, _ctx: RenderContext): void {
    noop();
  }

  public abstract toString(): string;
}

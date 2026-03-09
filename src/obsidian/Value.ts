import type { Value as ValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { castTo } from '../internal/cast.ts';

export abstract class Value {
  public static type: string;

  public static equals(a: null | Value, b: null | Value): boolean {
    if (a === null || b === null) {
      return a === b;
    }
    return a.equals(b);
  }

  public static looseEquals(a: null | Value, b: null | Value): boolean {
    if (a === null || b === null) {
      return a === b;
    }
    return a.looseEquals(b);
  }

  public asOriginalType__(): ValueOriginal {
    return castTo<ValueOriginal>(this);
  }

  public equals(other: this): boolean {
    return this.toString() === other.toString();
  }

  public abstract isTruthy(): boolean;

  public looseEquals(other: Value): boolean {
    return this.toString() === other.toString();
  }

  public renderTo(_el: HTMLElement, _ctx: RenderContext): void {
    // Pure UI operation.
  }

  public abstract toString(): string;
}

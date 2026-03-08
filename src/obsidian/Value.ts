import type { RenderContext } from './RenderContext.ts';

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

  public equals(other: this): boolean {
    return this.toString() === other.toString();
  }

  public isTruthy(): boolean {
    return this.isTruthy__();
  }

  public abstract isTruthy__(): boolean;

  public looseEquals(other: Value): boolean {
    return this.toString() === other.toString();
  }

  public renderTo(_el: HTMLElement, _ctx: RenderContext): void {
    // Pure UI operation.
  }

  public toString(): string {
    return this.toString__();
  }

  public abstract toString__(): string;
}

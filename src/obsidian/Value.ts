/**
 * @file
 *
 * Mock of Obsidian's `Value`, the root of the Bases value hierarchy.
 */

import type { Value as ValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Value` base class. The mock compares values by their string form and renders nothing.
 */
export abstract class Value {
  /**
   * The value type's identifier; declared but not assigned in the mock.
   */
  public static type: string;

  /**
   * Creates a value.
   */
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Compares two possibly-null values: two `null`s are equal, a `null` never equals a value, and otherwise
   * `a.equals(b)` decides.
   *
   * @param a - The first value.
   * @param b - The second value.
   * @returns Whether the values are equal.
   */
  public static equals(a: null | Value, b: null | Value): boolean {
    return a === null || b === null ? a === b : a.equals(b);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Value` as this mock.
   *
   * @param value - The value typed as the original `Value`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: ValueOriginal): Value {
    return strictProxy(value, Value);
  }

  /**
   * Loosely compares two possibly-null values: two `null`s are equal, a `null` never equals a value, and otherwise
   * `a.looseEquals(b)` decides.
   *
   * @param a - The first value.
   * @param b - The second value.
   * @returns Whether the values are loosely equal.
   */
  public static looseEquals(a: null | Value, b: null | Value): boolean {
    return a === null || b === null ? a === b : a.looseEquals(b);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Value` type.
   *
   * @returns The same object, typed as the original `Value`.
   */
  public asOriginalType__(): ValueOriginal {
    return strictProxy<ValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Value.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Compares this value with another of the same type. The mock compares their string forms.
   *
   * @param other - The value to compare with.
   * @returns Whether the values are equal.
   */
  public equals(other: this): boolean {
    return this.toString() === other.toString();
  }

  /**
   * Checks whether the value counts as truthy, such as a non-empty string or a non-zero number.
   *
   * @returns Whether the value is truthy.
   */
  public abstract isTruthy(): boolean;

  /**
   * Compares this value with a value of any type. The mock compares their string forms.
   *
   * @param other - The value to compare with.
   * @returns Whether the values are loosely equal.
   */
  public looseEquals(other: Value): boolean {
    return this.toString() === other.toString();
  }

  /**
   * Renders the value into an element. A no-op in the mock.
   *
   * @param _el - The element to render into.
   * @param _context - The rendering context.
   */
  public renderTo(_el: HTMLElement, _context: RenderContext): void {
    noop();
  }

  /**
   * Converts the value to its string form.
   *
   * @returns The string form of the value.
   */
  public abstract toString(): string;
}

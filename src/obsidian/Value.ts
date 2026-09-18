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
 * Mock of Obsidian's `Value` base class. It renders nothing, and it compares values by their string form.
 *
 * The string-form comparison is the one MODELLED departure here, and it lives on the two INSTANCE methods
 * alone. Obsidian's base `equals` and `looseEquals` both answer `false` and leave every real comparison to
 * the subclass - ten of them, each over its own fields. The mock answers the whole hierarchy with one
 * comparison of `toString()` output instead.
 *
 * The two STATICS are Obsidian's own, verbatim, and carry the class test that keeps that departure from
 * leaking across types: without it a `StringValue('1')` would equal a `NumberValue(1)`, because both print
 * `1`. So the pair is coherent rather than at odds - the departure is what makes the class test load-bearing.
 */
export abstract class Value {
  /**
   * The value type's identifier; declared but not assigned in the mock.
   */
  public static type: string;

  /**
   * The lucide icon name standing for this value's type.
   *
   * Obsidian assigns it in each class's constructor rather than reading it off the prototype, so a subclass
   * that wants its own icon overrides this field and every other subclass inherits the one above it.
   */
  public icon = 'lucide-file-question';

  /**
   * Creates a value.
   */
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Compares two possibly-null values, exactly as Obsidian's own static does: the same object is equal to
   * itself, a missing value equals only another missing one, two values of DIFFERENT classes are never equal,
   * and otherwise `a.equals(b)` decides. The missing test is Obsidian's own truthiness check rather than a
   * `null` one, so an `undefined` the declared signature does not admit, but a JavaScript consumer can still
   * pass, is answered rather than dereferenced.
   *
   * The class test is not decoration - it is what keeps the instance `equals`'s string-form departure honest.
   * Without it a `StringValue('1')` would equal a `NumberValue(1)`, because both print `1`.
   *
   * @param this - Unused; declared `void` so the function can be passed on as a comparator, which
   * {@link ListValue.compare} does.
   * @param a - The first value.
   * @param b - The second value.
   * @returns Whether the values are equal.
   */
  public static equals(this: void, a: null | Value, b: null | Value): boolean {
    return a === b || (!!a && !!b && a.constructor === b.constructor && a.equals(b));
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
   * Loosely compares two possibly-null values, exactly as Obsidian's own static does: the same object is
   * loosely equal to itself, a missing value only to another missing one - by the truthiness test the static
   * `equals` above describes - and otherwise strict equality is tried first, then `a.looseEquals(b)`, then
   * `b.looseEquals(a)`.
   *
   * BOTH directions are tried, which is what lets a one-element `ListValue` unwrap against a non-list
   * whichever side it is passed on - `ListValue` is the only class here that overrides `looseEquals`, so it
   * is also the only one whose two directions can disagree.
   *
   * @param this - Unused; declared `void` so the function can be passed on as a comparator, which
   * {@link ListValue.compare} does.
   * @param a - The first value.
   * @param b - The second value.
   * @returns Whether the values are loosely equal.
   */
  public static looseEquals(this: void, a: null | Value, b: null | Value): boolean {
    return a === b
      || (!!a && !!b && ((a.constructor === b.constructor && a.equals(b)) || a.looseEquals(b) || b.looseEquals(a)));
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
   * Compares this value with another of the same type. The mock compares their string forms, where Obsidian's
   * base answers `false` and each subclass compares its own fields; see the class doc for why.
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
   * Lists the property keys {@link Value.objectAccess} answers for, which is what a Bases formula's `.`
   * access can reach on this value.
   *
   * @returns No keys: the base value exposes none. A subclass concatenates its own onto this.
   */
  public keys(): string[] {
    return [];
  }

  /**
   * Compares this value with a value of any type. The mock compares their string forms, where Obsidian's base
   * answers `false` and each subclass loosens its own comparison; see the class doc for why.
   *
   * @param other - The value to compare with.
   * @returns Whether the values are loosely equal.
   */
  public looseEquals(other: Value): boolean {
    return this.toString() === other.toString();
  }

  /**
   * Reads a named sub-property of this value, as a Bases formula's `.` access does.
   *
   * @param _key - The property key, matched without regard to case.
   * @returns `null`: the base value exposes no properties. A subclass answers the keys it owns and defers
   * the rest to this.
   */
  public objectAccess(_key: string): null | Value {
    return null;
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

/**
 * @file
 *
 * Mock of Obsidian's `Value`, the root of the Bases value hierarchy.
 */

import type { Value as ValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';

import { castTo } from '../internal/castTo.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Value` base class. It renders nothing, and it compares nothing.
 *
 * Both instance comparisons answer `false`, exactly as Obsidian's base does: the base knows of no field to
 * compare, so every real comparison belongs to the subclass that owns one. `PrimitiveValue`, `NullValue`,
 * `ListValue`, `ObjectValue`, `DateValue`, `DurationValue`, `FileValue`, `UrlValue` and `LinkValue` each
 * override accordingly; everything else in the hierarchy inherits one of those or, like `RegExpValue`,
 * inherits this `false`.
 *
 * The two STATICS are Obsidian's own, verbatim, and they are what a caller should reach for: they answer
 * identity and missing values first, and compare the two classes before handing over to the instance pair.
 */
export abstract class Value {
  /**
   * The value type's identifier: Obsidian's own name for this class of value, `'Any'` on the base.
   *
   * Each subclass that has a name of its own overwrites it. The five that do NOT - `NotNullValue`,
   * `PrimitiveValue`, `RelativeDateValue`, `IconValue` and `TagValue` - answer with the nearest name above
   * them, exactly as they do in Obsidian: `'Any'` for the first two, `'Date'` for a relative date and
   * `'String'` for an icon and a tag.
   */
  public static type = 'Any';

  /**
   * The lucide icon name standing for this value's type.
   *
   * Obsidian assigns it in each class's constructor rather than reading it off the prototype, so a subclass
   * that wants its own icon overrides this field and every other subclass inherits the one above it.
   */
  public icon = 'lucide-file-question';

  /**
   * This value's CLASS, not its type name - Obsidian's own accessor, and its own oddity: the STATIC
   * `Value.type` is a name such as `'String'`, while this instance accessor answers the constructor
   * object. The mock models both as they are rather than reconciling the two.
   *
   * @returns This value's constructor.
   */
  public get type(): typeof Value {
    return castTo<typeof Value>(this.constructor);
  }

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
   * The class test is what lets each subclass's `equals` assume the other side is its own shape:
   * `PrimitiveValue.equals` reads `other.data`, `DateValue.equals` reads `other.time`, and neither has to
   * guard, because a value of another class never reaches them through this static.
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
   * BOTH directions are tried, and that matters wherever the two sides' overrides disagree: it is what lets
   * a one-element `ListValue` unwrap against a non-list whichever side it is passed on, and what lets a
   * `DateValue` and a `StringValue` holding its text compare equal in either order.
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
   * Converts the CLASS - not an instance - to its string form: the static `Value.type` name, so
   * `String(StringValue)` is `'String'`. Obsidian's own static, verbatim.
   *
   * Reached through `this`, so a subclass answers its own name without redeclaring anything.
   *
   * @returns The value type's identifier.
   */
  public static toString(): string {
    return this.type;
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
   * Compares this value with another of the same type.
   *
   * @param _other - The value to compare with.
   * @returns `false`: the base value has no field to compare, so a subclass that has one overrides this.
   */
  public equals(_other: this): boolean {
    return false;
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
   * Compares this value with a value of any type.
   *
   * @param _other - The value to compare with.
   * @returns `false`: the base value has no field to compare, so a subclass that loosens its own comparison
   * overrides this.
   */
  public looseEquals(_other: Value): boolean {
    return false;
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

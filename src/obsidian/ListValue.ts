/**
 * @file
 *
 * Mock of Obsidian's `ListValue`, the Bases value wrapping a list of values.
 */

import type { ListValue as ListValueOriginal } from 'obsidian';

import { isNumber } from '../globals/Number.ts';
// eslint-disable-next-line import-x/no-cycle -- The shared conversion constructs this class, exactly as Obsidian's own does.
import { lazyEvaluate } from '../internal/lazy-evaluator.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { DateValue } from './DateValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

/**
 * Obsidian's sort comparator, a verbatim copy of the collator it builds once and reuses: no locale, sorting
 * usage, base sensitivity (so case and accents do not separate two elements) and numeric collation (so `item
 * 10` sorts after `item 9`).
 */
const SORT_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
  usage: 'sort'
});

const HALF = 2;

/**
 * Mock of Obsidian's `ListValue`: a non-null value wrapping an array whose elements are `Value`s or raw data, not
 * necessarily of one type. A raw element is converted to a `Value` the first time {@link ListValue.get} reads it.
 */
export class ListValue extends NotNullValue {
  /**
   * The value type's identifier, `'List'` - Obsidian's own name for this class of value.
   */
  public static override type = 'List';

  /**
   * The list's elements, each a `Value` or raw data not yet converted. The array passed to the constructor, not a
   * copy.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public data: (unknown | Value)[];

  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-list';

  /**
   * Creates a list value.
   *
   * @param value - The list's elements, stored as {@link ListValue.data}.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor(value: (unknown | Value)[]) {
    super();
    this.data = value;
    const self = strictProxy(this);
    self.constructor3__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a list value, spyable via `vi.spyOn(ListValue, 'create__')`.
   *
   * @param value - The list's elements.
   * @returns The new list value.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public static create__(value: (unknown | Value)[]): ListValue {
    return new ListValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ListValue` as this mock.
   *
   * @param value - The value typed as the original `ListValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ListValueOriginal): ListValue {
    return strictProxy(value, ListValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ListValue` type.
   *
   * @returns The same object, typed as the original `ListValue`.
   */
  public asOriginalType3__(): ListValueOriginal {
    return strictProxy<ListValueOriginal>(this);
  }

  /**
   * Compares this list with another element by element.
   *
   * @param other - The list to compare with.
   * @param comparator - Decides whether two elements count as equal.
   * @returns `true` when the two lists share one array; `false` when their lengths differ; otherwise whether
   * every pair of elements is either the same raw element or accepted by `comparator`, which is handed the
   * two elements read through {@link ListValue.get}.
   */
  public compare(other: ListValue, comparator: (a: Value, b: Value) => boolean): boolean {
    if (this.data === other.data) {
      return true;
    }
    if (this.data.length !== other.data.length) {
      return false;
    }
    for (let index = 0; index < this.data.length; index++) {
      if (this.data[index] !== other.data[index] && !comparator(this.get(index), other.get(index))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Joins this list with another.
   *
   * @param other - The list whose elements come second.
   * @returns A new list holding this list's elements followed by `other`'s.
   */
  public concat(other: ListValue): ListValue {
    return ListValue.create__([...this.data, ...other.data]);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ListValue.prototype, 'constructor3__')`.
   *
   * @param _value - The contents the list was created with.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor3__(_value: (unknown | Value)[]): void {
    noop();
  }

  /**
   * Finds the earliest of the list's dates.
   *
   * @returns A `DateValue` over the earliest date {@link ListValue.getDates} finds, with its time, or
   * `NullValue.value` when the list holds no date. The returned value wraps that very `Date` rather than a
   * copy, as Obsidian's does.
   */
  public earliest(): Value {
    const dates = this.getDates();
    if (dates.length === 0) {
      return NullValue.value;
    }
    let earliest = ensureNonNullable(dates[0]);
    for (const date of dates) {
      if (date < earliest) {
        earliest = date;
      }
    }
    return DateValue.create__(earliest);
  }

  /**
   * Compares this list with another for equality.
   *
   * @param other - The list to compare with.
   * @returns Whether {@link ListValue.compare} holds under `Value.equals`. Unlike the inherited comparison,
   * this is element-wise rather than over the two lists' string forms, so a one-element list never equals a
   * longer one that happens to print the same.
   */
  public override equals(other: this): boolean {
    return this.compare(other, Value.equals);
  }

  /**
   * Flattens nested lists into this one.
   *
   * @returns A new list holding this list's elements with every nested `ListValue` and every nested raw array
   * replaced, recursively, by its own elements. The elements are moved as they are, raw or converted.
   */
  public flatten(): ListValue {
    const flattened: unknown[] = [];
    flattenInto(this.data, flattened);
    return ListValue.create__(flattened);
  }

  /**
   * Gets the element at an index.
   *
   * @param index - The zero-based index.
   * @returns `NullValue.value` when the index is out of range or the element is `null` or `undefined`. A `Value`
   * element as it is. Any other element converted by {@link ListValue.lazyEvaluator}, which replaces it in
   * {@link ListValue.data}.
   */
  public get(index: number): Value {
    const element = this.data[index];
    if (element === null || element === undefined) {
      return NullValue.value;
    }
    if (element instanceof Value) {
      return element;
    }
    const value = this.lazyEvaluator(index, element);
    this.data[index] = value;
    return value;
  }

  /**
   * Extracts the dates the list's elements stand for.
   *
   * It reads the RAW elements and never goes through {@link ListValue.get}, so nothing is converted or
   * cached by asking, and only three shapes count: a raw string and a `StringValue` are each parsed with
   * `DateValue.parseFromString`, and a `DateValue` is taken as it is. Everything else — a `NumberValue`
   * holding a timestamp, a raw `Date`, a nested list — is skipped.
   *
   * @returns The dates found, in the list's own order. Each is the `DateValue`'s own `Date`, not a copy.
   */
  public getDates(): Date[] {
    const dates: Date[] = [];
    for (const element of this.data) {
      let dateValue: DateValue | null = null;
      if (typeof element === 'string') {
        dateValue = DateValue.parseFromString(element);
      } else if (element instanceof StringValue) {
        dateValue = DateValue.parseFromString(element.data);
      } else if (element instanceof DateValue) {
        dateValue = element;
      }
      if (dateValue) {
        dates.push(dateValue.date);
      }
    }
    return dates;
  }

  /**
   * Extracts the numbers among the list's elements.
   *
   * It reads the RAW elements and never goes through {@link ListValue.get}, so nothing is converted or
   * cached by asking, and only two shapes count: a raw number other than `NaN`, and a `NumberValue`. A
   * numeric string is NOT one of them.
   *
   * @returns The numbers found, in the list's own order.
   */
  public getNumbers(): number[] {
    const numbers: number[] = [];
    for (const element of this.data) {
      if (isNumber(element)) {
        numbers.push(element);
      } else if (element instanceof NumberValue) {
        numbers.push(element.data);
      }
    }
    return numbers;
  }

  /**
   * Tells whether the list contains a value.
   *
   * @param value - The value to look for.
   * @returns Whether `Value.looseEquals` holds between `value` and any element.
   */
  public includes(value: Value): boolean {
    for (let index = 0; index < this.data.length; index++) {
      if (Value.looseEquals(value, this.get(index))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Whether the list has at least one element.
   */
  public isTruthy(): boolean {
    return this.data.length > 0;
  }

  /**
   * Joins the elements' text.
   *
   * @param separator - The text between two elements.
   * @returns A string value of the joined elements. A raw string, boolean or number is written with `String`; any
   * other element is read through {@link ListValue.get} and written with its `toString`.
   */
  public join(separator: string): StringValue {
    const parts = this.data.map((element, index) =>
      typeof element === 'string' || typeof element === 'boolean' || (typeof element === 'number' && !Number.isNaN(element))
        ? String(element)
        : this.get(index).toString()
    );
    return StringValue.create__(parts.join(separator));
  }

  /**
   * Lists the property keys {@link ListValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by `length`.
   */
  public override keys(): string[] {
    return [...super.keys(), 'length'];
  }

  /**
   * Finds the latest of the list's dates.
   *
   * @returns A `DateValue` over the latest date {@link ListValue.getDates} finds, with its time, or
   * `NullValue.value` when the list holds no date. The returned value wraps that very `Date` rather than a
   * copy, as Obsidian's does.
   */
  public latest(): Value {
    const dates = this.getDates();
    if (dates.length === 0) {
      return NullValue.value;
    }
    let latest = ensureNonNullable(dates[0]);
    for (const date of dates) {
      if (date > latest) {
        latest = date;
      }
    }
    return DateValue.create__(latest);
  }

  /**
   * Converts a raw element to a `Value`, as Obsidian's default evaluator does.
   *
   * @param _index - The element's index.
   * @param raw - The raw element.
   * @returns `NullValue.value` for `null`, `undefined` or a function; a `StringValue`, `NumberValue` (`NaN`
   * excluded) or `BooleanValue` for a primitive; a `ListValue` over a copy of an array; a `DateValue` over a copy of
   * a `Date`; and an `ObjectValue` over a shallow copy of any other object.
   * @throws {Error} For any other raw value, such as a `symbol`, a `bigint` or `NaN`.
   */
  public lazyEvaluator(_index: number, raw: unknown): Value {
    return lazyEvaluate(raw);
  }

  /**
   * Gets the number of elements in the list.
   *
   * @returns The element count.
   */
  public length(): number {
    return this.data.length;
  }

  /**
   * Loosely compares this list with any value.
   *
   * @param other - The value to compare with.
   * @returns For another list, whether {@link ListValue.compare} holds under `Value.looseEquals`. For
   * anything else, whether this list holds exactly one element that loosely equals it — so `[1]` loosely
   * equals `1` while `[1, 2]` equals nothing but a list.
   */
  public override looseEquals(other: Value): boolean {
    return other instanceof ListValue
      ? this.compare(other, Value.looseEquals)
      : this.data.length === 1 && Value.looseEquals(this.get(0), other);
  }

  /**
   * Finds the largest of the list's numbers.
   *
   * @returns A `NumberValue` over the largest number {@link ListValue.getNumbers} finds, or
   * `NullValue.value` when the list holds none.
   */
  public max(): Value {
    const numbers = this.getNumbers();
    return numbers.length === 0 ? NullValue.value : NumberValue.create__(Math.max(...numbers));
  }

  /**
   * Averages the list's numbers.
   *
   * @returns A `NumberValue` over the sum of the numbers {@link ListValue.getNumbers} finds divided by
   * {@link ListValue.length} — the WHOLE list's length, not the count of numbers, which is Obsidian's own
   * arithmetic and means a list mixing numbers with anything else averages low. `NullValue.value` when the
   * list holds no number.
   */
  public mean(): Value {
    const numbers = this.getNumbers();
    return numbers.length === 0 ? NullValue.value : NumberValue.create__(sumOf(numbers) / this.length());
  }

  /**
   * Finds the middle of the list's numbers.
   *
   * @returns A `NumberValue` over the median of the numbers {@link ListValue.getNumbers} finds — the mean of
   * the middle two when there is an even count of them — or `NullValue.value` when the list holds none.
   */
  public median(): Value {
    const numbers = this.getNumbers();
    numbers.sort((a, b) => a - b);
    const count = numbers.length;
    if (count === 0) {
      return NullValue.value;
    }
    const median = count % HALF === 0
      ? (ensureNonNullable(numbers[count / HALF]) + ensureNonNullable(numbers[count / HALF - 1])) / HALF
      : ensureNonNullable(numbers[(count - 1) / HALF]);
    return NumberValue.create__(median);
  }

  /**
   * Finds the smallest of the list's numbers.
   *
   * @returns A `NumberValue` over the smallest number {@link ListValue.getNumbers} finds, or
   * `NullValue.value` when the list holds none.
   */
  public min(): Value {
    const numbers = this.getNumbers();
    return numbers.length === 0 ? NullValue.value : NumberValue.create__(Math.min(...numbers));
  }

  /**
   * Reads a named sub-property of this value.
   *
   * @param key - The property key, matched without regard to case.
   * @returns The element count as a `NumberValue` for `length`, and otherwise whatever the base answers.
   */
  public override objectAccess(key: string): null | Value {
    return key.toLowerCase() === 'length' ? NumberValue.create__(this.data.length) : super.objectAccess(key);
  }

  /**
   * Reverses the list.
   *
   * @returns A new list over a copy of this list's elements in the opposite order. This list is untouched.
   */
  public reverse(): ListValue {
    return ListValue.create__([...this.data].reverse());
  }

  /**
   * Takes a run of the list's elements.
   *
   * @param start - The index to start at; the list's start when omitted, counted from the end when negative.
   * @param end - The index to stop before; the list's end when omitted, counted from the end when negative.
   * @returns A new list over those elements, moved as they are, raw or converted.
   */
  public slice(start?: number, end?: number): ListValue {
    return ListValue.create__(this.data.slice(start, end));
  }

  /**
   * Sorts the list.
   *
   * @returns A new list over a copy of this list's elements in ascending order. Each element is sorted by its
   * wrapped primitive when it is a `PrimitiveValue`, by its string form when it is any other `Value`, and by
   * itself when it is raw; two numbers compare numerically and anything else through Obsidian's collator,
   * which ignores case and accents and orders embedded digits numerically. This list is untouched.
   */
  public sort(): ListValue {
    const sorted = [...this.data].sort((a, b) => {
      const left = toSortKey(a);
      const right = toSortKey(b);
      return isNumber(left) && isNumber(right) ? left - right : SORT_COLLATOR.compare(String(left), String(right));
    });
    return ListValue.create__(sorted);
  }

  /**
   * Measures how far the list's numbers spread around their mean.
   *
   * @returns A `NumberValue` over the POPULATION standard deviation of the numbers
   * {@link ListValue.getNumbers} finds — divided by their count, not by one less — or `NullValue.value` when
   * the list holds none.
   */
  public stddev(): Value {
    const numbers = this.getNumbers();
    if (numbers.length === 0) {
      return NullValue.value;
    }
    const mean = sumOf(numbers) / numbers.length;
    const squaredDeviations = numbers.map((number) => {
      const deviation = number - mean;
      return deviation * deviation;
    });
    return NumberValue.create__(Math.sqrt(sumOf(squaredDeviations) / squaredDeviations.length));
  }

  /**
   * Adds up the list's numbers.
   *
   * @returns A `NumberValue` over the sum of the numbers {@link ListValue.getNumbers} finds, or
   * `NullValue.value` when the list holds none.
   */
  public sum(): Value {
    const numbers = this.getNumbers();
    return numbers.length === 0 ? NullValue.value : NumberValue.create__(sumOf(numbers));
  }

  /**
   * Renders the list as a string.
   *
   * @returns The elements joined with `, `, as {@link ListValue.join} writes them.
   */
  public toString(): string {
    return this.join(', ').data;
  }

  /**
   * Drops the list's duplicates.
   *
   * @returns A new list over the CONVERTED elements, every one of them a `Value`, keeping the first of each
   * run that `Value.equals` accepts. Obsidian buckets them by string form in a plain object and then reads
   * the buckets back in key order, so elements whose string form is an integer come FIRST, in numeric order,
   * ahead of everything else in its original order — a quirk this mirrors rather than corrects.
   */
  public unique(): ListValue {
    const buckets: Record<string, Value[]> = {};
    for (let index = 0; index < this.data.length; index++) {
      const value = this.get(index);
      const key = value.toString();
      const bucket = Object.hasOwn(buckets, key) ? buckets[key] : undefined;
      if (bucket) {
        if (bucket.every((existing) => !Value.equals(value, existing))) {
          bucket.push(value);
        }
      } else {
        buckets[key] = [value];
      }
    }
    return ListValue.create__(Object.values(buckets).flat());
  }
}

function flattenInto(elements: readonly unknown[], flattened: unknown[]): void {
  for (const element of elements) {
    if (element instanceof ListValue) {
      flattenInto(element.data, flattened);
    } else if (Array.isArray(element)) {
      flattenInto(element, flattened);
    } else {
      flattened.push(element);
    }
  }
}

function sumOf(numbers: readonly number[]): number {
  return numbers.reduce((total, number) => total + number, 0);
}

function toSortKey(element: unknown): unknown {
  if (element instanceof PrimitiveValue) {
    const primitive: PrimitiveValue<unknown> = element;
    return primitive.data;
  }
  return element instanceof Value ? element.toString() : element;
}

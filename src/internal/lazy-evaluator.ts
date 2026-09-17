/**
 * @file
 *
 * The conversion behind every Bases value's `lazyEvaluator`: a raw element or property turned into a
 * `Value`.
 *
 * Obsidian has one such function and both `ListValue` and `ObjectValue` install it as their default
 * evaluator, so it lives beside them here rather than in either class. It has to construct the very
 * classes that call it, which is why the import cycle below cannot be broken.
 */

import type { Value } from '../obsidian/Value.ts';

/* eslint-disable import-x/no-cycle -- The conversion constructs the value classes that call it, exactly as Obsidian's own does. */
import { BooleanValue } from '../obsidian/BooleanValue.ts';
import { DateValue } from '../obsidian/DateValue.ts';
import { ListValue } from '../obsidian/ListValue.ts';
import { NullValue } from '../obsidian/NullValue.ts';
import { NumberValue } from '../obsidian/NumberValue.ts';
import { ObjectValue } from '../obsidian/ObjectValue.ts';
import { StringValue } from '../obsidian/StringValue.ts';
/* eslint-enable import-x/no-cycle -- The conversion constructs the value classes that call it, exactly as Obsidian's own does. */

/**
 * Converts a raw element or property to a `Value`, as Obsidian's default evaluator does.
 *
 * @param raw - The raw value to convert.
 * @returns `NullValue.value` for `null`, `undefined` or a function; a `StringValue`, `NumberValue`
 * (`NaN` excluded) or `BooleanValue` for a primitive; a `ListValue` over a copy of an array; a
 * `DateValue` over a copy of a `Date`; and an `ObjectValue` over a shallow copy of any other object.
 * @throws {Error} For any other raw value, such as a `symbol`, a `bigint` or `NaN`.
 */
export function lazyEvaluate(raw: unknown): Value {
  if (raw === null || raw === undefined || typeof raw === 'function') {
    return NullValue.value;
  }
  if (typeof raw === 'string') {
    return StringValue.create__(raw);
  }
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return NumberValue.create__(raw);
  }
  if (typeof raw === 'boolean') {
    return BooleanValue.create__(raw);
  }
  if (Array.isArray(raw)) {
    return ListValue.create__([...raw]);
  }
  if (raw instanceof Date) {
    return DateValue.create__(new Date(raw));
  }
  if (typeof raw === 'object') {
    return ObjectValue.create__({ ...raw });
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Only a symbol, a bigint or NaN reaches this line.
  throw new Error(`Value type is unsupported ${String(raw)}`);
}

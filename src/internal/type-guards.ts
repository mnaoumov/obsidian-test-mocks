/**
 * @file
 *
 * Assertion and narrowing helpers used throughout the mocks.
 */

import { noop } from './noop.ts';

/**
 * An object whose string keys may be read and written freely.
 */
export type GenericObject = Record<string, unknown>;

type NullableConstraint<T> = null extends T ? unknown : undefined extends T ? unknown : never;

/**
 * Throws unless a condition holds, narrowing types for the code after it.
 *
 * @param condition - The condition that must be `true`.
 * @param errorOrMessage - The error to throw, or the message of a new `Error`.
 * @throws The given error, or an `Error` with the given message, when `condition` is `false`.
 */
// eslint-disable-next-line unicorn/consistent-boolean-name -- TypeScript's `asserts condition` predicate names the parameter, and `condition` is the spelling its own documentation and every assert helper uses.
export function assert(condition: boolean, errorOrMessage: Error | string): asserts condition {
  if (!condition) {
    throw typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage;
  }
}

/**
 * Narrows an object to {@link GenericObject} without any runtime check.
 *
 * @param _object - The object to narrow. Not inspected.
 */
export function assertGenericObject(_object: object): asserts _object is GenericObject {
  noop();
}

/**
 * Throws when a value is `null` or `undefined`, narrowing it to `NonNullable` for the code after it.
 *
 * @typeParam T - The value's type, which must admit `null` or `undefined`.
 * @param value - The value to check.
 * @param errorOrMessage - The error to throw, or the message of a new `Error`; by default the message says whether
 * the value was `null` or `undefined`.
 * @throws The given error, or an `Error`, when `value` is `null` or `undefined`.
 */
export function assertNonNullable<T extends NullableConstraint<T>>(value: T, errorOrMessage?: Error | string): asserts value is NonNullable<T> {
  if (value !== null && value !== undefined) {
    return;
  }

  errorOrMessage ??= value === null ? 'Value is null' : 'Value is undefined';
  const error = typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage;
  throw error;
}

/**
 * Views an object as a {@link GenericObject} as well as its own type, without any runtime check.
 *
 * @typeParam T - The object's type.
 * @param object - The object to view.
 * @returns The same object, typed so arbitrary string keys can be read and written.
 */
export function ensureGenericObject<T extends object>(object: T): GenericObject & T {
  return object as GenericObject & T;
}

/**
 * Returns a value after checking it is neither `null` nor `undefined`, as {@link assertNonNullable} does.
 *
 * @typeParam T - The value's type, which must admit `null` or `undefined`.
 * @param value - The value to check.
 * @param errorOrMessage - The error to throw, or the message of a new `Error`.
 * @returns The same value, typed as `NonNullable`.
 * @throws The given error, or an `Error`, when `value` is `null` or `undefined`.
 */
export function ensureNonNullable<T extends NullableConstraint<T>>(value: T, errorOrMessage?: Error | string): NonNullable<T> {
  assertNonNullable(value, errorOrMessage);
  return value;
}

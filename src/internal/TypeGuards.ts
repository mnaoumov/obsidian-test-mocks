/**
 * @packageDocumentation
 *
 * Type guard utilities.
 */

import { noop } from './Noop.ts';

/**
 * A type that represents a generic object.
 */
export type GenericObject = Record<string, unknown>;

type NullableConstraint<T> = null extends T ? unknown : undefined extends T ? unknown : never;

/**
 * Asserts that a value is a generic object.
 *
 * @param _obj - The value to assert.
 */
export function assertGenericObject(_obj: object): asserts _obj is GenericObject {
  noop();
}

/**
 * Asserts that a value is not null or undefined.
 *
 * @typeParam T - The type of the value.
 * @param value - The value to check.
 * @param errorOrMessage - Optional error or error message.
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
 * Ensures that a value is a generic object.
 *
 * @param obj - The value to ensure.
 * @returns The value as a generic object.
 */
export function ensureGenericObject(obj: object): GenericObject {
  return obj as GenericObject;
}

/**
 * Ensures that a value is not null or undefined.
 *
 * @typeParam T - The type of the value.
 * @param value - The value to check.
 * @param errorOrMessage - Optional error or error message.
 * @returns The value with null and undefined excluded.
 */
export function ensureNonNullable<T extends NullableConstraint<T>>(value: T, errorOrMessage?: Error | string): NonNullable<T> {
  assertNonNullable(value, errorOrMessage);
  return value;
}

import { noop } from './noop.ts';

export type GenericObject = Record<string, unknown>;

type NullableConstraint<T> = null extends T ? unknown : undefined extends T ? unknown : never;

// eslint-disable-next-line unicorn/consistent-boolean-name -- TypeScript's `asserts condition` predicate names the parameter, and `condition` is the spelling its own documentation and every assert helper uses.
export function assert(condition: boolean, errorOrMessage: Error | string): asserts condition {
  if (!condition) {
    throw typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage;
  }
}

export function assertGenericObject(_object: object): asserts _object is GenericObject {
  noop();
}

export function assertNonNullable<T extends NullableConstraint<T>>(value: T, errorOrMessage?: Error | string): asserts value is NonNullable<T> {
  if (value !== null && value !== undefined) {
    return;
  }

  errorOrMessage ??= value === null ? 'Value is null' : 'Value is undefined';
  const error = typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage;
  throw error;
}

export function ensureGenericObject<T extends object>(object: T): GenericObject & T {
  return object as GenericObject & T;
}

export function ensureNonNullable<T extends NullableConstraint<T>>(value: T, errorOrMessage?: Error | string): NonNullable<T> {
  assertNonNullable(value, errorOrMessage);
  return value;
}

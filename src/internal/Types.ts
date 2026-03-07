/**
 * @packageDocumentation
 *
 * Shared type aliases.
 */

/**
 * A type that represents a return value that may be void.
 *
 * @typeParam T - The type of the value that may be returned.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type MaybeReturn<T> = T | void;

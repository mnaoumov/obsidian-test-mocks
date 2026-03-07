/**
 * @packageDocumentation
 *
 * Type casting utilities.
 */

/**
 * Casts a value to a specific type.
 *
 * @param value - The value to cast.
 * @returns The value as the specified type.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function castTo<T>(value: unknown): T {
  return value as T;
}

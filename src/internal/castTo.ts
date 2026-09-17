/**
 * @file
 *
 * The unchecked cast helper mocks use to bridge their types to Obsidian's.
 */

/**
 * Casts a value to any type without checking it, for bridging mock types to Obsidian's where the two are known to
 * be compatible at runtime.
 *
 * @typeParam T - The type to view the value as.
 * @param value - The value to cast.
 * @returns The same value, typed as `T`.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- We need to cast.
export function castTo<T>(value: unknown): T {
  return value as T;
}

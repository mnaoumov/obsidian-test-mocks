/**
 * @packageDocumentation
 *
 * No-op utility functions.
 */

/**
 * A function that does nothing.
 */
export function noop(): void {
  // Does nothing.
}

/**
 * A function that does nothing asynchronously.
 *
 * @returns A resolved promise.
 */
export async function noopAsync(): Promise<void> {
  // Does nothing.
}

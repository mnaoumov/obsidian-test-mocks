/**
 * @file
 *
 * Do-nothing functions that mark a mocked member as intentionally empty.
 */

/**
 * Does nothing. Called from mock members that have no observable effect, so the empty body is explicit.
 */
export function noop(): void {
  // Does nothing.
}

/**
 * Does nothing asynchronously. Awaited from async mock members, so they yield once like real async work.
 */
export async function noopAsync(): Promise<void> {
  // Does nothing.
}

/**
 * @file
 *
 * Mock of Obsidian's `requireApiVersion`.
 */

/**
 * Checks whether the running API version is at least the requested one. The mock always answers `true`.
 *
 * @param _version - The minimum API version required.
 * @returns `true`.
 */
export function requireApiVersion(_version: string): boolean {
  return true;
}

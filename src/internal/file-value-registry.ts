/**
 * @file
 *
 * Bookkeeping that lets a `LinkValue` recognize a `FileValue` without importing it.
 *
 * `LinkValue.looseEquals` answers the file a link resolves to, which Obsidian decides with an `instanceof`.
 * The mock cannot: `FileValue` already imports `LinkValue` — it builds one per backlink — so the reverse
 * import would close a cycle, and through two internal modules as well. Registering each file value here
 * instead keeps the test in one place, exactly as `workspace-layout.ts` does for the layout tree.
 */

import type { FileValue } from '../obsidian/FileValue.ts';
import type { Value } from '../obsidian/Value.ts';

import { bypassStrictProxy } from './strict-proxy.ts';

const fileValues = new WeakSet();

/**
 * Checks whether a value was registered as a file value by {@link markFileValue}.
 *
 * @param value - The value to check.
 * @returns Whether the value is a `FileValue`.
 */
export function isFileValue(value: Value): value is FileValue {
  return fileValues.has(bypassStrictProxy(value));
}

/**
 * Registers a value as a `FileValue`, for {@link isFileValue}.
 *
 * @param value - The file value.
 */
export function markFileValue(value: object): void {
  fileValues.add(bypassStrictProxy(value));
}

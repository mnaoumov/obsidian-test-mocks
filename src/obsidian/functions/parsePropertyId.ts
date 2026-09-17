/**
 * @file
 *
 * Mock of Obsidian's `parsePropertyId`.
 */

import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesProperty as BasesPropertyOriginal,
  BasesPropertyType as BasesPropertyTypeOriginal
} from 'obsidian';

import { assert } from '../../internal/type-guards.ts';

/**
 * Splits a Bases property id, such as `note.status` or `file.name`, into its type and name.
 *
 * @param propertyId - The property id.
 * @returns The part before the first `.` as `type`, and the rest as `name`.
 * @throws If the id contains no `.`.
 */
export function parsePropertyId(propertyId: BasesPropertyIdOriginal): BasesPropertyOriginal {
  const dotIndex = propertyId.indexOf('.');
  assert(dotIndex !== -1, `Invalid BasesPropertyId: "${propertyId}"`);
  return { name: propertyId.slice(dotIndex + 1), type: propertyId.slice(0, dotIndex) as BasesPropertyTypeOriginal };
}

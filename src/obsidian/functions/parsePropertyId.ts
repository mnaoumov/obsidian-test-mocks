import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesProperty as BasesPropertyOriginal,
  BasesPropertyType as BasesPropertyTypeOriginal
} from 'obsidian';

import { assert } from '../../internal/type-guards.ts';

export function parsePropertyId(propertyId: BasesPropertyIdOriginal): BasesPropertyOriginal {
  const dotIndex = propertyId.indexOf('.');
  assert(dotIndex !== -1, `Invalid BasesPropertyId: "${propertyId}"`);
  return { name: propertyId.slice(dotIndex + 1), type: propertyId.slice(0, dotIndex) as BasesPropertyTypeOriginal };
}

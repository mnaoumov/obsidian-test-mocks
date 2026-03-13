import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesProperty as BasesPropertyOriginal,
  BasesPropertyType as BasesPropertyTypeOriginal
} from 'obsidian';

export function parsePropertyId(propertyId: BasesPropertyIdOriginal): BasesPropertyOriginal {
  const dotIndex = propertyId.indexOf('.');
  if (dotIndex === -1) {
    return { name: propertyId, type: propertyId as BasesPropertyTypeOriginal };
  }
  return { name: propertyId.slice(dotIndex + 1), type: propertyId.slice(0, dotIndex) as BasesPropertyTypeOriginal };
}

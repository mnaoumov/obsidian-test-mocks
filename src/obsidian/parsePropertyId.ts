export function parsePropertyId(propertyId: string): { name: string; type: string } {
  const dotIndex = propertyId.indexOf('.');
  if (dotIndex === -1) {
    return { name: propertyId, type: 'text' };
  }
  return { name: propertyId.slice(dotIndex + 1), type: propertyId.slice(0, dotIndex) };
}

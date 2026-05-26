export function defineMissingProperty(target: object, property: string, descriptor: PropertyDescriptor): void {
  if (property in target) {
    return;
  }
  Object.defineProperty(target, property, {
    configurable: true,
    enumerable: false,
    ...descriptor
  });
}

export function deleteMissingProperty(target: object, property: string): void {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Removing a bridge property from a prototype.
  delete (target as Record<string, unknown>)[property];
}

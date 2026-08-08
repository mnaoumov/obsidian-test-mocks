export function defineMissingProperty(target: object, property: string, descriptor: PropertyDescriptor): void {
  // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
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

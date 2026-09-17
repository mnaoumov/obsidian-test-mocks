/**
 * @file
 *
 * Helpers that add a property to an object only when neither it nor its prototype chain already has one, and remove
 * it again.
 */

/**
 * Defines a configurable, non-enumerable property unless the object already has one of that name, own or inherited.
 *
 * @param target - The object to define the property on.
 * @param property - The property name.
 * @param descriptor - The property descriptor; its own `configurable` / `enumerable` settings override the defaults.
 */
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

/**
 * Deletes an own property, typically one {@link defineMissingProperty} added.
 *
 * @param target - The object to delete the property from.
 * @param property - The property name.
 */
export function deleteMissingProperty(target: object, property: string): void {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Removing a bridge property from a prototype.
  delete (target as Record<string, unknown>)[property];
}

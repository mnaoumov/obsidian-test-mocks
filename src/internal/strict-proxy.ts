/**
 * Strict proxy for mock objects.
 *
 * Wraps an object in a `Proxy` that throws a descriptive error when any
 * unmocked property is accessed, instead of silently returning `undefined`.
 *
 * - Idempotent (double-wrapping is a no-op).
 * - Passthrough for well-known props (`then`, `toJSON`, `Symbol.iterator`, etc.).
 * - Class-name-aware error messages for class instances.
 * - Recursive proxying of nested plain objects (for partial mocks only).
 *
 * Overloads:
 * 1. `strictProxy(value, MockClass)` — `fromOriginalTypeN__`: infers T from
 *    MockClass.prototype, overlays `__` methods via proxy.
 * 2. `strictProxy(value: T)` — constructors: infers T from argument.
 * 3. `strictProxy<T>(partial)` — test mocking: typed via `PartialDeep<T>`.
 * 4. `strictProxy<T>(value)` — `asOriginalTypeN__`: explicit T, unchecked.
 */
import type { PartialDeep } from 'type-fest';

import { ensureGenericObject } from './type-guards.ts';

const STRICT_PROXY_TARGET_SYMBOL = Symbol.for('strictProxyTarget');

const PASSTHROUGH_PROPS = new Set<string | symbol>([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  'then',
  'toJSON'
]);

type MockClassLike<T> = MockClassPrototypeRef<T> & MockClassRef;

interface MockClassPrototypeRef<T> {
  prototype: T;
}

interface MockClassRef {
  name: string;
  prototype: object;
}

/**
 * Bypasses strict proxy.
 *
 * @param obj - The object to bypass.
 * @returns The object with the bypass accessor.
 */
export function bypassStrictProxy<T>(object: T): T {
  if (!isObjectLike(object)) {
    return object;
  }
  // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
  if (!(STRICT_PROXY_TARGET_SYMBOL in object)) {
    return object;
  }
  return object[STRICT_PROXY_TARGET_SYMBOL] as T;
}
// eslint-disable-next-line @typescript-eslint/unified-signatures -- This overload infers T from mockClass; the `unknown` overload below requires explicit T. Cannot be combined.
export function strictProxy<T>(value: unknown, mockClass: MockClassLike<T>): T;
export function strictProxy<T extends object>(value: T): T;
export function strictProxy<T>(value: PartialDeep<T>): T;
// eslint-disable-next-line @typescript-eslint/unified-signatures, @typescript-eslint/no-unnecessary-type-parameters -- PartialDeep<T> above gives type safety for test partial mocks; this overload accepts explicit T with unchecked value for cross-type casts.
export function strictProxy<T>(value: unknown): T;
export function strictProxy<T>(value: unknown, mockClass?: MockClassRef): T {
  return wrapProxy<T>(value, mockClass);
}

function isObjectLike(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
function wrapProxy<T>(value: unknown, mockClass?: MockClassRef): T {
  if (!isObjectLike(value)) {
    return value as T;
  }

  // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
  if (STRICT_PROXY_TARGET_SYMBOL in value) {
    return value as T;
  }
  Object.defineProperty(value, STRICT_PROXY_TARGET_SYMBOL, { value });

  const isClass = !isPlainObject(value);
  const className = mockClass?.name ?? (isClass ? value.constructor.name : '');
  const mockPrototype = mockClass ? ensureGenericObject(mockClass.prototype) : null;
  const proxiedChildren = isClass ? null : new Map<string | symbol>();

  return new Proxy(value, {
    get(target, property, receiver): unknown {
      // 1. Own properties and prototype chain of the original object
      // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
      if (property in target) {
        if (proxiedChildren?.has(property)) {
          return proxiedChildren.get(property);
        }

        const $value: unknown = Reflect.get(target, property, receiver);
        if (proxiedChildren && isPlainObject($value)) {
          const result = wrapProxy<unknown>($value);
          proxiedChildren.set(property, result);
          return result;
        }
        return $value;
      }

      // 2. Mock prototype chain (for __ methods on fromOriginalType)
      // eslint-disable-next-line unicorn/no-computed-property-existence-check -- `in` walks the PROTOTYPE CHAIN, which is the point here; `Object.hasOwn` only sees own properties and would change what this checks.
      if (mockPrototype && typeof property === 'string' && property.endsWith('__') && property in mockPrototype) {
        const $value: unknown = mockPrototype[property];
        if (typeof $value === 'function') {
          return $value.bind(receiver);
        }
        return $value;
      }

      // 3. Passthrough props (symbols, then, toJSON, etc.)
      if (typeof property === 'symbol' || PASSTHROUGH_PROPS.has(property)) {
        return Reflect.get(target, property, receiver);
      }

      throw new Error(`Property "${property}" is not mocked in ${className}. To override, assign a value first: mock.${property} = ...`);
    }
  }) as T;
}

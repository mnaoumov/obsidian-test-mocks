/**
 * Creates a strictly-typed mock object from a full or partial implementation.
 * Uses a `Proxy` to throw an error if any unmocked property is accessed,
 * preventing silent `undefined` returns that don't match the actual type.
 *
 * Nested plain objects are recursively proxied for deep protection.
 * Functions (including `vi.fn()`), arrays, class instances, and primitives
 * are passed through without proxying.
 *
 * For class instances, the error message includes the class name for easier
 * debugging (e.g., "Property X is not mocked in App").
 *
 * Idempotent: calling on an already-proxied object returns it unchanged.
 */
import type { PartialDeep } from 'type-fest';

const STRICT_MOCK_MARKER = Symbol('strictMock');

const PASSTHROUGH_PROPS = new Set<string | symbol>([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  'then',
  'toJSON'
]);

/**
 * Type-safe version — accepts full objects (inferring T) or deep-partial objects.
 */
export function createMockOf<T extends object>(value: T): T;
export function createMockOf<T>(partial: PartialDeep<T>): T;
export function createMockOf<T>(value: unknown): T {
  return createMockOfUnsafe<T>(value);
}

/**
 * Version for internal use. Accepts full objects (inferring T) or unknown values
 * (for type bridging in asOriginalType / fromOriginalType).
 */
export function createMockOfUnsafe<T extends object>(value: T): T;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function createMockOfUnsafe<T>(value: unknown): T;
export function createMockOfUnsafe<T>(value: unknown): T {
  if (!isObjectLike(value)) {
    return value as T;
  }

  if (STRICT_MOCK_MARKER in value) {
    return value as T;
  }
  Object.defineProperty(value, STRICT_MOCK_MARKER, { value: true });

  const isClass = !isPlainObject(value);
  const className = isClass ? value.constructor.name : '';
  const proxiedChildren = isClass ? null : new Map<string | symbol, unknown>();

  return new Proxy(value, {
    get(target, prop, receiver): unknown {
      if (typeof prop === 'symbol' || prop in target || PASSTHROUGH_PROPS.has(prop)) {
        if (proxiedChildren?.has(prop)) {
          return proxiedChildren.get(prop);
        }

        const val: unknown = Reflect.get(target, prop, receiver);
        if (proxiedChildren && isPlainObject(val)) {
          const result = createMockOfUnsafe<unknown>(val);
          proxiedChildren.set(prop, result);
          return result;
        }
        return val;
      }

      const label = isClass
        ? `Property "${prop}" is not mocked in ${className}. To override, assign a value first: mock.${prop} = ...`
        : `Unmocked property "${prop}" was accessed on mock object`;
      throw new Error(label);
    }
  }) as T;
}

function isObjectLike(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

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

const STRICT_PROXY_MARKER = Symbol('strictProxy');

const PASSTHROUGH_PROPS = new Set<string | symbol>([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  'then',
  'toJSON'
]);

type MockClassLike<T> = { prototype: T } & MockClassRef;

interface MockClassRef {
  name: string;
  prototype: object;
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

  if (STRICT_PROXY_MARKER in value) {
    return value as T;
  }
  Object.defineProperty(value, STRICT_PROXY_MARKER, { value: true });

  const isClass = !isPlainObject(value);
  const className = mockClass?.name ?? (isClass ? value.constructor.name : '');
  const mockProto = mockClass ? mockClass.prototype as Record<string, unknown> : null;
  const proxiedChildren = isClass ? null : new Map<string | symbol, unknown>();

  return new Proxy(value, {
    get(target, prop, receiver): unknown {
      // 1. Own properties and prototype chain of the original object
      if (prop in target) {
        if (proxiedChildren?.has(prop)) {
          return proxiedChildren.get(prop);
        }

        const val: unknown = Reflect.get(target, prop, receiver);
        if (proxiedChildren && isPlainObject(val)) {
          const result = wrapProxy<unknown>(val);
          proxiedChildren.set(prop, result);
          return result;
        }
        return val;
      }

      // 2. Mock prototype chain (for __ methods on fromOriginalType)
      if (mockProto && typeof prop === 'string' && prop.endsWith('__') && prop in mockProto) {
        const val: unknown = mockProto[prop];
        if (typeof val === 'function') {
          return val.bind(receiver);
        }
        return val;
      }

      // 3. Passthrough props (symbols, then, toJSON, etc.)
      if (typeof prop === 'symbol' || PASSTHROUGH_PROPS.has(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      throw new Error(`Property "${prop}" is not mocked in ${className}. To override, assign a value first: mock.${prop} = ...`);
    }
  }) as T;
}

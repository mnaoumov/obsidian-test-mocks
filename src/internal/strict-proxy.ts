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
 * Two entry points:
 * - `strictProxy<T>()` — type-safe (`PartialDeep<T>`). Use for test mocking.
 *   Compile errors reveal real type incompatibilities.
 * - `strictProxyForce<T>()` — accepts `unknown`. Use for constructors,
 *   `asOriginalTypeN__`, and `fromOriginalTypeN__` (with `mockClass` param
 *   to overlay `__` methods from the mock prototype).
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

/**
 * Type-safe strict proxy. Prefer this over `strictProxyForce`.
 * Compile errors from `PartialDeep<T>` reveal real structural gaps.
 */
export function strictProxy<T>(value: PartialDeep<T>): T {
  return wrapProxy<T>(value);
}

/**
 * Strict proxy that accepts any value.
 *
 * - Constructor wrapping: `strictProxyForce(this)`
 * - `asOriginalTypeN__`: `strictProxyForce<OriginalType>(this)`
 * - `fromOriginalTypeN__`: `strictProxyForce<MockType>(value, MockClass)`
 *   — overlays `__` methods from MockClass prototype via Proxy lookup.
 *
 * @param mockClass - When provided, the proxy also resolves `__` methods
 *   from this class's prototype chain, making them available on objects
 *   that weren't created as mocks.
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures -- Overload 1 infers T from mockClass; overload 3 accepts explicit T with unchecked value. They serve different purposes.
export function strictProxyForce<T>(value: unknown, mockClass: MockClassLike<T>): T;
export function strictProxyForce<T extends object>(value: T): T;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function strictProxyForce<T>(value: unknown): T;
export function strictProxyForce<T>(value: unknown, mockClass?: MockClassRef): T {
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

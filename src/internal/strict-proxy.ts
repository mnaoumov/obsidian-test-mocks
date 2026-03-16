/**
 * Strict proxy utilities for mock objects.
 *
 * Every mock object is wrapped in a `Proxy` that throws a descriptive error
 * when any unmocked property is accessed, instead of silently returning `undefined`.
 *
 * Two entry points:
 * - `strictProxy<T>()` — type-safe, for constructors and test mocking.
 * - `bridgeType<T>()` — untyped, for cross-type-system casts
 *   (`asOriginalTypeN__` / `fromOriginalTypeN__`).
 *
 * Both share the same proxy logic:
 * - Idempotent (double-wrapping is a no-op).
 * - Passthrough for well-known props (`then`, `toJSON`, `Symbol.iterator`, etc.).
 * - Class-name-aware error messages for class instances.
 * - Recursive proxying of nested plain objects (for partial test mocks only).
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

/**
 * Wraps a value in a strict proxy and casts it to `T`.
 * Used for type bridging between mock and obsidian type systems
 * where the input and output types are structurally different
 * (`asOriginalTypeN__` / `fromOriginalTypeN__`).
 */
export function bridgeType<T extends object>(value: T): T;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function bridgeType<T>(value: unknown): T;
export function bridgeType<T>(value: unknown): T {
  if (!isObjectLike(value)) {
    return value as T;
  }

  if (STRICT_PROXY_MARKER in value) {
    return value as T;
  }
  Object.defineProperty(value, STRICT_PROXY_MARKER, { value: true });

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
          const result = bridgeType<unknown>(val);
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

/**
 * Wraps a value in a strict proxy that throws on unmocked property access.
 * Type-safe: infers `T` from the argument, or accepts `PartialDeep<T>`.
 *
 * Use in constructors (`strictProxy(this)`) and test mocking
 * (`strictProxy<MyInterface>({ partialImpl })`).
 */
export function strictProxy<T extends object>(value: T): T;
export function strictProxy<T>(partial: PartialDeep<T>): T;
export function strictProxy<T>(value: unknown): T {
  return bridgeType<T>(value);
}

function isObjectLike(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

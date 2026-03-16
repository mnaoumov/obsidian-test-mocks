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
 * - `strictProxy<T>()` — type-safe (`PartialDeep<T>`). Use for constructors and
 *   `asOriginalTypeN__()`. Compile errors reveal real type incompatibilities.
 * - `strictProxyForce<T>()` — accepts `unknown`. Use only when `strictProxy` can't
 *   work due to TypeScript limitations (recursive generics, cross-module types).
 */
import type { PartialDeep } from 'type-fest';

import { ensureGenericObject } from './type-guards.ts';

const STRICT_PROXY_MARKER = Symbol('strictProxy');

const PASSTHROUGH_PROPS = new Set<string | symbol>([
  Symbol.iterator,
  Symbol.toPrimitive,
  Symbol.toStringTag,
  'then',
  'toJSON'
]);

/**
 * Wraps an obsidian-typed object in a Proxy that overlays mock class prototype
 * methods. Property lookup: original object first, then mock prototype chain.
 * This makes `__` members available without mutating the original object.
 * Used by `fromOriginalTypeN__()`.
 *
 * @param mockClass - The mock class whose prototype provides `__` methods.
 * @param value - The obsidian-typed object.
 * @returns A proxy typed as `T` with mock `__` methods overlaid.
 */
interface MockClassRef {
  name: string;
  prototype: object;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function mergePrototype<T>(mockClass: MockClassRef, value: unknown): T {
  if (!isObjectLike(value)) {
    return value as T;
  }

  if (STRICT_PROXY_MARKER in value) {
    return value as T;
  }
  Object.defineProperty(value, STRICT_PROXY_MARKER, { value: true });

  const mockProto = ensureGenericObject(mockClass.prototype);
  const className = mockClass.name;

  return new Proxy(value, {
    get(target, prop, receiver): unknown {
      // 1. Own properties and prototype chain of the original object
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      // 2. Mock prototype chain (for __ methods)
      if (typeof prop === 'string' && prop.endsWith('__') && prop in mockProto) {
        const val: unknown = mockProto[prop];
        if (typeof val === 'function') {
          return val.bind(receiver);
        }
        return val;
      }

      // 3. Passthrough props
      if (typeof prop === 'symbol' || PASSTHROUGH_PROPS.has(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      throw new Error(`Property "${prop}" is not mocked in ${className}. To override, assign a value first: mock.${prop} = ...`);
    }
  }) as T;
}

/**
 * Type-safe strict proxy. Prefer this over `strictProxyForce`.
 * Compile errors from `PartialDeep<T>` reveal real structural gaps.
 */
export function strictProxy<T>(value: PartialDeep<T>): T {
  return wrapProxy<T>(value);
}
/**
 * Strict proxy that accepts any value. Use for constructor wrapping
 * (`strictProxyForce(this)`) and cross-type casts (`asOriginalTypeN__`).
 * Prefer `strictProxy` for test code where `PartialDeep<T>` compiles.
 */
export function strictProxyForce<T extends object>(value: T): T;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function strictProxyForce<T>(value: unknown): T;
export function strictProxyForce<T>(value: unknown): T {
  return wrapProxy<T>(value);
}

function isObjectLike(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
function wrapProxy<T>(value: unknown): T {
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
          const result = wrapProxy<unknown>(val);
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

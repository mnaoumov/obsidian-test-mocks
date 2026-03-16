import { createMockOfUnsafe } from './create-mock-of.ts';

/**
 * Wraps a class instance in a strict proxy that throws on unmocked property access.
 * Delegates to `createMockOfUnsafe`, which handles idempotent double-wrap protection,
 * passthrough props (`Symbol.iterator`, `then`, `toJSON`, etc.), and class-name-aware
 * error messages.
 */
export function strictMock<T extends object>(instance: T): T {
  return createMockOfUnsafe<T>(instance);
}

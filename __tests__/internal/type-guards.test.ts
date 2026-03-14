import {
  describe,
  expect,
  it
} from 'vitest';

import {
  assertGenericObject,
  assertNonNullable,
  ensureGenericObject,
  ensureNonNullable
} from '../../src/internal/type-guards.ts';

describe('assertNonNullable', () => {
  it('should not throw for non-null value', () => {
    expect(() => {
      assertNonNullable('hello' as null | string);
    }).not.toThrow();
  });

  it('should throw for null value', () => {
    expect(() => {
      assertNonNullable(null as null | string);
    }).toThrow('Value is null');
  });

  it('should throw for undefined value', () => {
    expect(() => {
      assertNonNullable(undefined as string | undefined);
    }).toThrow('Value is undefined');
  });

  it('should throw with custom message', () => {
    expect(() => {
      assertNonNullable(null as null | string, 'Custom message');
    }).toThrow('Custom message');
  });

  it('should throw the provided Error object', () => {
    const error = new TypeError('Custom error');
    expect(() => {
      assertNonNullable(null as null | string, error);
    }).toThrow(error);
  });
});

describe('ensureNonNullable', () => {
  it('should return the value when non-null', () => {
    const result = ensureNonNullable('hello' as null | string);
    expect(result).toBe('hello');
  });

  it('should throw for null', () => {
    expect(() => {
      ensureNonNullable(null as null | string);
    }).toThrow();
  });

  it('should throw for undefined', () => {
    expect(() => {
      ensureNonNullable(undefined as string | undefined);
    }).toThrow();
  });

  it('should throw with custom error message', () => {
    expect(() => {
      ensureNonNullable(null as null | string, 'Missing value');
    }).toThrow('Missing value');
  });
});

describe('assertGenericObject', () => {
  it('should not throw for an object', () => {
    expect(() => {
      assertGenericObject({ key: 'value' });
    }).not.toThrow();
  });
});

describe('ensureGenericObject', () => {
  it('should return the object as GenericObject', () => {
    const obj = { key: 'value' };
    const result = ensureGenericObject(obj);
    expect(result['key']).toBe('value');
  });
});

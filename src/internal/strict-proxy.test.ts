import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  bypassStrictProxy,
  strictProxy
} from './strict-proxy.ts';
import { ensureGenericObject } from './type-guards.ts';

interface DeepNested {
  flag: boolean;
}

interface MockTarget {
  name: string;
  nested: Nested;
  run(): string;
}

interface Nested {
  deep: DeepNested;
  value: number;
}

/**
 * The properties `@vitest/pretty-format` and the matchers duck-type on, none of which belongs to an
 * Obsidian API. Mirrors `PASSTHROUGH_PROPS` in `strict-proxy.ts`.
 */
const PROBED_BY_TEST_TOOLING = [
  '$$typeof',
  '_isMockFunction',
  '@@__IMMUTABLE_ITERABLE__@@',
  '@@__IMMUTABLE_KEYED__@@',
  '@@__IMMUTABLE_LIST__@@',
  '@@__IMMUTABLE_MAP__@@',
  '@@__IMMUTABLE_ORDERED__@@',
  '@@__IMMUTABLE_RECORD__@@',
  '@@__IMMUTABLE_SEQ__@@',
  '@@__IMMUTABLE_SET__@@',
  '@@__IMMUTABLE_STACK__@@',
  'asymmetricMatch',
  'nodeType',
  'tagName'
];

const TEST_VALUE = 42;

describe('strictProxy', () => {
  it('should return mocked properties', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    expect(mock.name).toBe('test');
  });

  it('should throw on unmocked property access', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    expect(() => mock.run()).toThrow('Property "run" is not mocked');
  });

  it('should yield rather than throw on the properties test tooling duck-types on', () => {
    const mock = strictProxy<Record<string, unknown>>({ name: 'test' });
    for (const property of PROBED_BY_TEST_TOOLING) {
      expect(mock[property]).toBeUndefined();
    }
  });

  it('should let a failing assertion render its diff instead of throwing while formatting', () => {
    // This is why the properties above must not throw.
    // `@vitest/pretty-format` probes them to pick a serializer, and it does so while rendering the
    // Mismatch — so a throw there replaced the whole diff with the strict-proxy error, leaving no way
    // To see what actually differed.
    const $function = vi.fn();
    $function(strictProxy<MockTarget>({ name: 'actual' }));

    expect(() => {
      expect($function).toHaveBeenCalledWith(strictProxy<MockTarget>({ name: 'expected' }));
    }).not.toThrow('is not mocked');
  });

  it('should recursively proxy nested plain objects', () => {
    const mock = strictProxy<MockTarget>({ nested: { value: TEST_VALUE } });
    expect(mock.nested.value).toBe(TEST_VALUE);
    expect(() => mock.nested.deep).toThrow('Property "deep" is not mocked');
  });

  it('should cache proxied children', () => {
    const mock = strictProxy<MockTarget>({ nested: { value: TEST_VALUE } });
    const first = mock.nested;
    const second = mock.nested;
    expect(first).toBe(second);
  });

  it('should pass through functions without proxying', () => {
    const $function = vi.fn().mockReturnValue('result');
    const mock = strictProxy<MockTarget>({ run: $function });
    expect(mock.run()).toBe('result');
  });

  it('should pass through arrays without proxying', () => {
    const mock = strictProxy({ items: [1, 0, -1] });
    expect(mock.items).toEqual([1, 0, -1]);
  });

  it('should pass through class instances without proxying', () => {
    const map = new Map<string, number>([['a', 1]]);
    const mock = strictProxy({ data: map });
    expect(mock.data.get('a')).toBe(1);
  });

  it('should pass through primitives', () => {
    expect(strictProxy<string>('hello')).toBe('hello');
    expect(strictProxy<number>(TEST_VALUE)).toBe(TEST_VALUE);
    expect(strictProxy<boolean>(true)).toBe(true);
    expect(strictProxy<null>(null)).toBeNull();
  });

  it('should not throw on symbol property access', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    const sym = Symbol('test');
    expect(() => {
      Reflect.get(mock, sym);
    }).not.toThrow();
  });

  it('should return undefined for then to support await', async () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    const result = await Promise.resolve(mock);
    expect(result.name).toBe('test');
  });
});

describe('strictProxy', () => {
  it('should wrap a class instance and throw on unmocked property', () => {
    class MyClass {
      public name = 'test';
    }
    const instance = new MyClass();
    const proxied = strictProxy(instance);
    expect(proxied.name).toBe('test');
    expect(() => {
      ensureGenericObject(proxied)['missing']?.toString();
    }).toThrow('Property "missing" is not mocked in MyClass');
  });

  it('should be idempotent', () => {
    class MyClass {
      public value = 1;
    }
    const instance = new MyClass();
    const first = strictProxy(instance);
    const second = strictProxy(first);
    expect(second).toBe(first);
  });
});

describe('strictProxy with mockClass', () => {
  it('should expose __ methods from the mock prototype', () => {
    class MockClass {
      public helper__(): string {
        return 'mock-helper';
      }
    }
    const value = { name: 'test' };
    const proxied = strictProxy(value, MockClass);
    const record = ensureGenericObject(proxied);
    const helper = record.helper__.bind(record);
    expect(helper()).toBe('mock-helper');
  });

  it('should return non-function __ properties from the mock prototype', () => {
    class MockClass {
      public name = '';
    }
    Object.defineProperty(MockClass.prototype, 'flag__', { value: 'proto-value' });
    const value = { name: 'test' };
    const proxied = strictProxy(value, MockClass);
    expect(ensureGenericObject(proxied)['flag__']).toBe('proto-value');
  });
});

describe('bypassStrictProxy', () => {
  it('should return the unwrapped object', () => {
    const original = { name: 'test' };
    const proxied = strictProxy<MockTarget>(original);
    const unwrapped = bypassStrictProxy(proxied);
    expect(unwrapped).toBe(original);
  });

  it('should allow accessing unmocked properties on the unwrapped object', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    const unwrapped = bypassStrictProxy(mock);
    expect(ensureGenericObject(unwrapped)['unmocked']).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(bypassStrictProxy('hello')).toBe('hello');
    expect(bypassStrictProxy(TEST_VALUE)).toBe(TEST_VALUE);
    expect(bypassStrictProxy(null)).toBeNull();
  });

  it('should return non-proxy objects as-is', () => {
    const object = { name: 'test' };
    expect(bypassStrictProxy(object)).toBe(object);
  });
});

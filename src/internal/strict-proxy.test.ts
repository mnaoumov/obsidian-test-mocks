import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { strictProxy } from './strict-proxy.ts';

interface DeepNested {
  flag: boolean;
}

interface MockTarget {
  fn(): string;
  name: string;
  nested: Nested;
}

interface Nested {
  deep: DeepNested;
  value: number;
}

interface WithData {
  data: Map<string, number>;
}

interface WithItems {
  items: number[];
}

const TEST_VALUE = 42;

describe('strictProxy', () => {
  it('should return mocked properties', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    expect(mock.name).toBe('test');
  });

  it('should throw on unmocked property access', () => {
    const mock = strictProxy<MockTarget>({ name: 'test' });
    expect(() => mock.fn()).toThrow('Unmocked property "fn" was accessed on mock object');
  });

  it('should recursively proxy nested plain objects', () => {
    const mock = strictProxy<MockTarget>({ nested: { value: TEST_VALUE } });
    expect(mock.nested.value).toBe(TEST_VALUE);
    expect(() => mock.nested.deep).toThrow('Unmocked property "deep" was accessed on mock object');
  });

  it('should cache proxied children', () => {
    const mock = strictProxy<MockTarget>({ nested: { value: TEST_VALUE } });
    const first = mock.nested;
    const second = mock.nested;
    expect(first).toBe(second);
  });

  it('should pass through functions without proxying', () => {
    const fn = vi.fn().mockReturnValue('result');
    const mock = strictProxy<MockTarget>({ fn });
    expect(mock.fn()).toBe('result');
  });

  it('should pass through arrays without proxying', () => {
    const mock = strictProxy<WithItems>({ items: [1, 0, -1] });
    expect(mock.items).toEqual([1, 0, -1]);
  });

  it('should pass through class instances without proxying', () => {
    const map = new Map<string, number>();
    map.set('a', 1);
    const mock = strictProxy<WithData>({ data: map });
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

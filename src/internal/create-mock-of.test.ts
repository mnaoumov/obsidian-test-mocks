import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { createMockOf } from './create-mock-of.ts';

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

describe('createMockOf', () => {
  it('should return mocked properties', () => {
    const mock = createMockOf<MockTarget>({ name: 'test' });
    expect(mock.name).toBe('test');
  });

  it('should throw on unmocked property access', () => {
    const mock = createMockOf<MockTarget>({ name: 'test' });
    expect(() => mock.fn()).toThrow('Unmocked property "fn" was accessed on mock object');
  });

  it('should recursively proxy nested plain objects', () => {
    const mock = createMockOf<MockTarget>({ nested: { value: TEST_VALUE } });
    expect(mock.nested.value).toBe(TEST_VALUE);
    expect(() => mock.nested.deep).toThrow('Unmocked property "deep" was accessed on mock object');
  });

  it('should cache proxied children', () => {
    const mock = createMockOf<MockTarget>({ nested: { value: TEST_VALUE } });
    const first = mock.nested;
    const second = mock.nested;
    expect(first).toBe(second);
  });

  it('should pass through functions without proxying', () => {
    const fn = vi.fn().mockReturnValue('result');
    const mock = createMockOf<MockTarget>({ fn });
    expect(mock.fn()).toBe('result');
  });

  it('should pass through arrays without proxying', () => {
    const mock = createMockOf<WithItems>({ items: [1, 0, -1] });
    expect(mock.items).toEqual([1, 0, -1]);
  });

  it('should pass through class instances without proxying', () => {
    const map = new Map<string, number>();
    map.set('a', 1);
    const mock = createMockOf<WithData>({ data: map });
    expect(mock.data.get('a')).toBe(1);
  });

  it('should pass through primitives', () => {
    expect(createMockOf<string>('hello')).toBe('hello');
    expect(createMockOf<number>(TEST_VALUE)).toBe(TEST_VALUE);
    expect(createMockOf<boolean>(true)).toBe(true);
    expect(createMockOf<null>(null)).toBeNull();
  });

  it('should not throw on symbol property access', () => {
    const mock = createMockOf<MockTarget>({ name: 'test' });
    const sym = Symbol('test');
    expect(() => {
      Reflect.get(mock, sym);
    }).not.toThrow();
  });

  it('should return undefined for then to support await', async () => {
    const mock = createMockOf<MockTarget>({ name: 'test' });
    const result = await Promise.resolve(mock);
    expect(result.name).toBe('test');
  });
});

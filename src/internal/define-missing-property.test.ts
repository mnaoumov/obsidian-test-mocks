import {
  describe,
  expect,
  it
} from 'vitest';

import {
  defineMissingProperty,
  deleteMissingProperty
} from './define-missing-property.ts';

describe('defineMissingProperty', () => {
  it('should define a property on the target', () => {
    const target: Record<string, unknown> = {};
    defineMissingProperty(target, 'foo', { value: 42 });
    expect(target['foo']).toBe(42);
  });

  it('should not overwrite an existing property', () => {
    const target: Record<string, unknown> = { foo: 'original' };
    defineMissingProperty(target, 'foo', { value: 'replaced' });
    expect(target['foo']).toBe('original');
  });

  it('should define a non-enumerable property by default', () => {
    const target: Record<string, unknown> = {};
    defineMissingProperty(target, 'foo', { value: 42 });
    expect(Object.keys(target)).toEqual([]);
  });

  it('should define a configurable property by default', () => {
    const target: Record<string, unknown> = {};
    defineMissingProperty(target, 'foo', { value: 42 });
    const desc = Object.getOwnPropertyDescriptor(target, 'foo');
    expect(desc?.configurable).toBe(true);
  });

  it('should allow descriptor to override defaults', () => {
    const target: Record<string, unknown> = {};
    defineMissingProperty(target, 'foo', { enumerable: true, value: 42 });
    expect(Object.keys(target)).toEqual(['foo']);
  });

  it('should support getter/setter descriptors', () => {
    const target: Record<string, unknown> = {};
    let backing = 0;
    defineMissingProperty(target, 'foo', {
      get(): number {
        return backing;
      },
      set(value: number) {
        backing = value;
      }
    });
    expect(target['foo']).toBe(0);
    target['foo'] = 99;
    expect(target['foo']).toBe(99);
    expect(backing).toBe(99);
  });
});

describe('deleteMissingProperty', () => {
  it('should delete a property from the target', () => {
    const target: Record<string, unknown> = { foo: 42 };
    deleteMissingProperty(target, 'foo');
    expect('foo' in target).toBe(false);
  });

  it('should not throw when deleting a non-existent property', () => {
    const target: Record<string, unknown> = {};
    expect(() => {
      deleteMissingProperty(target, 'foo');
    }).not.toThrow();
  });
});

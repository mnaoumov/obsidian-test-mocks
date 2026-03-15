import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { HTMLValue } from './HTMLValue.ts';

describe('HTMLValue', () => {
  it('should create an instance via create2__', () => {
    const value = HTMLValue.create2__('test');
    expect(value).toBeInstanceOf(HTMLValue);
  });

  it('should default to empty string', () => {
    const value = HTMLValue.create2__();
    expect(value.value__).toBe('');
  });

  it('should store the provided value', () => {
    const value = HTMLValue.create2__('<b>bold</b>');
    expect(value.value__).toBe('<b>bold</b>');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const value = HTMLValue.create2__();
      const original: HTMLValueOriginal = value.asOriginalType__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = HTMLValue.create2__();
      const mock = HTMLValue.fromOriginalType3__(value.asOriginalType__());
      expect(mock).toBe(value);
    });
  });
});

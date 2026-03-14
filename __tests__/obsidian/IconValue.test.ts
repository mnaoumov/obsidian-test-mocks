import type { IconValue as IconValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { IconValue } from '../../src/obsidian/IconValue.ts';

describe('IconValue', () => {
  it('should create an instance via create2__', () => {
    const value = IconValue.create2__('icon-name');
    expect(value).toBeInstanceOf(IconValue);
  });

  it('should default to empty string', () => {
    const value = IconValue.create2__();
    expect(value.value__).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const value = IconValue.create2__();
      const original: IconValueOriginal = value.asOriginalType__();
      expect(original).toBe(value);
    });
  });
});

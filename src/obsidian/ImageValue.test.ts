import type { ImageValue as ImageValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ImageValue } from './ImageValue.ts';

describe('ImageValue', () => {
  it('should create an instance via create2__', () => {
    const value = ImageValue.create2__('image-url');
    expect(value).toBeInstanceOf(ImageValue);
  });

  it('should default to empty string', () => {
    const value = ImageValue.create2__();
    expect(value.value__).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const value = ImageValue.create2__();
      const original: ImageValueOriginal = value.asOriginalType__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ImageValue.create2__();
      const mock = ImageValue.fromOriginalType3__(value.asOriginalType__());
      expect(mock).toBe(value);
    });
  });
});

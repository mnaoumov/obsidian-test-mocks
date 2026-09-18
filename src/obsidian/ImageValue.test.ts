import type { ImageValue as ImageValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ImageValue } from './ImageValue.ts';

describe('ImageValue', () => {
  it('should carry the image icon', () => {
    expect(new ImageValue().icon).toBe('lucide-image');
  });

  it('should create an instance via create2__', () => {
    const value = ImageValue.create2__('image-url');
    expect(value).toBeInstanceOf(ImageValue);
  });

  it('should default to empty string', () => {
    const value = ImageValue.create2__();
    expect(value.data).toBe('');
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = ImageValue.create2__();
      const original: ImageValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ImageValue.create2__();
      const mock = ImageValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });
});

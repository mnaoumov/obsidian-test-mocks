import type { UrlValue as UrlValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { UrlValue } from './UrlValue.ts';

describe('UrlValue', () => {
  it('should create an instance via create2__', () => {
    const val = UrlValue.create2__('https://example.com');
    expect(val).toBeInstanceOf(UrlValue);
  });

  it('should store the value', () => {
    const val = UrlValue.create2__('https://example.com');
    expect(val.value__).toBe('https://example.com');
  });

  it('should accept display parameter', () => {
    const val = UrlValue.create2__('https://example.com', 'Example');
    expect(val).toBeInstanceOf(UrlValue);
  });

  it('should be truthy for non-empty urls', () => {
    const val = UrlValue.create2__('https://example.com');
    expect(val.isTruthy()).toBe(true);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = UrlValue.create2__('https://example.com');
      const original: UrlValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});

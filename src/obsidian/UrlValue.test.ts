import type { UrlValue as UrlValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { UrlValue } from './UrlValue.ts';

describe('UrlValue', () => {
  it('should create an instance via create2__', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value).toBeInstanceOf(UrlValue);
  });

  it('should store the value', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value.value__).toBe('https://example.com');
  });

  it('should accept display parameter', () => {
    const value = UrlValue.create2__('https://example.com', 'Example');
    expect(value).toBeInstanceOf(UrlValue);
  });

  it('should be truthy for non-empty urls', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value.isTruthy()).toBe(true);
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = UrlValue.create2__('https://example.com');
      const original: UrlValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = UrlValue.create2__('https://example.com');
      const mock = UrlValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });
});

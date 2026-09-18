import type { UrlValue as UrlValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { StringValue } from './StringValue.ts';
import { UrlValue } from './UrlValue.ts';

describe('UrlValue', () => {
  it('should carry the link icon', () => {
    expect(UrlValue.create2__('https://example.com').icon).toBe('lucide-link');
  });

  it('should create an instance via create2__', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value).toBeInstanceOf(UrlValue);
  });

  it('should store the value', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value.data).toBe('https://example.com');
  });

  it('should accept display parameter', () => {
    const value = UrlValue.create2__('https://example.com', 'Example');
    expect(value).toBeInstanceOf(UrlValue);
  });

  it('should be truthy for non-empty urls', () => {
    const value = UrlValue.create2__('https://example.com');
    expect(value.isTruthy()).toBe(true);
  });

  describe('display', () => {
    it('should default to null', () => {
      expect(UrlValue.create2__('https://example.com').display).toBeNull();
      expect(UrlValue.create2__('https://example.com', null).display).toBeNull();
    });

    it('should wrap a plain string, and keep a string value as given', () => {
      expect(UrlValue.create2__('https://example.com', 'Example').display?.data).toBe('Example');
      const shown = StringValue.create__('Example');
      expect(UrlValue.create2__('https://example.com', shown).display).toBe(shown);
    });
  });

  describe('equals', () => {
    it('should compare the url and the display text', () => {
      const value = UrlValue.create2__('https://example.com', 'Example');
      expect(value.equals(UrlValue.create2__('https://example.com', 'Example'))).toBe(true);
      expect(value.equals(UrlValue.create2__('https://example.com', 'Other'))).toBe(false);
      expect(value.equals(UrlValue.create2__('https://other.com', 'Example'))).toBe(false);
    });

    it('should treat a missing display text as equal only to another missing one', () => {
      const bare = UrlValue.create2__('https://example.com');
      expect(bare.equals(UrlValue.create2__('https://example.com'))).toBe(true);
      expect(bare.equals(UrlValue.create2__('https://example.com', 'Example'))).toBe(false);
    });
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

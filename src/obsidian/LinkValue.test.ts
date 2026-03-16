import {
  describe,
  expect,
  it
} from 'vitest';

import type { App } from './App.ts';

import { strictProxy } from '../internal/strict-proxy.ts';
import { LinkValue } from './LinkValue.ts';

describe('LinkValue', () => {
  const mockApp = strictProxy<App>({});

  describe('parseFromString', () => {
    it('should parse a simple wiki link', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note]]', '');
      expect(result).toBeInstanceOf(LinkValue);
      expect(result?.value__).toBe('note');
    });

    it('should parse a wiki link with display text', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note|display]]', '');
      expect(result?.value__).toBe('note');
    });

    it('should return null for non-wiki-link text', () => {
      const result = LinkValue.parseFromString(mockApp, 'plain text', '');
      expect(result).toBeNull();
    });

    it('should return null for partial wiki link syntax', () => {
      const result = LinkValue.parseFromString(mockApp, '[[incomplete', '');
      expect(result).toBeNull();
    });

    it('should return null for empty wiki link content', () => {
      const result = LinkValue.parseFromString(mockApp, '[[]]', '');
      expect(result).toBeNull();
    });
  });

  describe('create2__', () => {
    it('should create an instance via factory method', () => {
      const val = LinkValue.create2__(mockApp, 'note', '');
      expect(val).toBeInstanceOf(LinkValue);
    });
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance', () => {
      const val = LinkValue.create2__(mockApp, 'note', '');
      const original = val.asOriginalType5__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = LinkValue.create2__(mockApp, 'note', '');
      const mock = LinkValue.fromOriginalType5__(val.asOriginalType5__());
      expect(mock).toBe(val);
    });
  });
});

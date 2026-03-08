import type { App } from 'obsidian';

import { describe, expect, it } from 'vitest';

import { LinkValue } from 'obsidian';

describe('LinkValue', () => {
  const mockApp = {} as App;

  describe('parseFromString', () => {
    it('should parse a simple wiki link', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note]]', '');
      expect(result).toBeInstanceOf(LinkValue);
      expect(result?.value).toBe('note');
    });

    it('should parse a wiki link with display text', () => {
      const result = LinkValue.parseFromString(mockApp, '[[note|display]]', '');
      expect(result?.value).toBe('note');
    });

    it('should return null for non-wiki-link text', () => {
      const result = LinkValue.parseFromString(mockApp, 'plain text', '');
      expect(result).toBeNull();
    });

    it('should return null for partial wiki link syntax', () => {
      const result = LinkValue.parseFromString(mockApp, '[[incomplete', '');
      expect(result).toBeNull();
    });

    it('should handle empty wiki link content', () => {
      const result = LinkValue.parseFromString(mockApp, '[[]]', '');
      expect(result).toBeNull();
    });
  });
});

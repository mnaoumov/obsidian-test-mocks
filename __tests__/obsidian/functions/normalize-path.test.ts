import {
  describe,
  expect,
  it
} from 'vitest';

import { normalizePath } from '../../../src/obsidian/functions/normalizePath.ts';

describe('normalizePath', () => {
  it('should replace backslashes with forward slashes', () => {
    expect(normalizePath('a\\b\\c')).toBe('a/b/c');
  });

  it('should collapse multiple consecutive slashes', () => {
    expect(normalizePath('a///b//c')).toBe('a/b/c');
  });

  it('should remove leading slash', () => {
    expect(normalizePath('/a/b')).toBe('a/b');
  });

  it('should remove trailing slash', () => {
    expect(normalizePath('a/b/')).toBe('a/b');
  });

  it('should handle empty string', () => {
    expect(normalizePath('')).toBe('');
  });

  it('should handle a path with no modifications needed', () => {
    expect(normalizePath('a/b/c')).toBe('a/b/c');
  });

  it('should handle a root-only path', () => {
    expect(normalizePath('/')).toBe('');
  });
});

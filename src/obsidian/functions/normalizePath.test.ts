import {
  describe,
  expect,
  it
} from 'vitest';

import { normalizePath } from './normalizePath.ts';

describe('normalizePath', () => {
  it('should replace backslashes with forward slashes', () => {
    expect(normalizePath(String.raw`a\b\c`)).toBe('a/b/c');
  });

  it('should collapse multiple consecutive slashes', () => {
    expect(normalizePath('a///b//c')).toBe('a/b/c');
  });

  it('should collapse a mixed run of backslashes and slashes', () => {
    expect(normalizePath(String.raw`a\/\b`)).toBe('a/b');
  });

  it('should remove leading slash', () => {
    expect(normalizePath('/a/b')).toBe('a/b');
  });

  it('should remove trailing slash', () => {
    expect(normalizePath('a/b/')).toBe('a/b');
  });

  it('should return the root for an empty string', () => {
    expect(normalizePath('')).toBe('/');
  });

  it('should handle a path with no modifications needed', () => {
    expect(normalizePath('a/b/c')).toBe('a/b/c');
  });

  it('should return the root for a root-only path', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('should return the root for a path of slashes only', () => {
    expect(normalizePath(String.raw`//\/`)).toBe('/');
  });

  it('should replace a no-break space with a space', () => {
    expect(normalizePath('a\u{A0}b')).toBe('a b');
  });

  it('should replace a narrow no-break space with a space', () => {
    expect(normalizePath('a\u{202F}b')).toBe('a b');
  });

  it('should put a decomposed name in NFC', () => {
    const decomposed = 'cafe\u{301}/note.md';
    const result = normalizePath(decomposed);
    expect(result).toBe('caf\u{E9}/note.md');
    expect(result).not.toBe(decomposed);
  });

  it('should keep a name already in NFC unchanged', () => {
    expect(normalizePath('caf\u{E9}.md')).toBe('caf\u{E9}.md');
  });
});

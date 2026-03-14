import {
  describe,
  expect,
  it
} from 'vitest';

import { parseLinktext } from './parseLinktext.ts';

describe('parseLinktext', () => {
  it('should return the full text as path when no hash present', () => {
    const result = parseLinktext('my-note');
    expect(result.path).toBe('my-note');
    expect(result.subpath).toBe('');
  });

  it('should split on hash into path and subpath', () => {
    const result = parseLinktext('note#heading');
    expect(result.path).toBe('note');
    expect(result.subpath).toBe('#heading');
  });

  it('should handle empty path when linktext starts with hash', () => {
    const result = parseLinktext('#heading');
    expect(result.path).toBe('');
    expect(result.subpath).toBe('#heading');
  });

  it('should handle empty string', () => {
    const result = parseLinktext('');
    expect(result.path).toBe('');
    expect(result.subpath).toBe('');
  });
});

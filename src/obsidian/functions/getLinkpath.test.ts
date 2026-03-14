import {
  describe,
  expect,
  it
} from 'vitest';

import { getLinkpath } from './getLinkpath.ts';

describe('getLinkpath', () => {
  it('should return the path without a subpath', () => {
    expect(getLinkpath('note')).toBe('note');
  });

  it('should strip the hash and subpath', () => {
    expect(getLinkpath('note#heading')).toBe('note');
  });

  it('should handle multiple hashes by splitting on the first', () => {
    expect(getLinkpath('note#heading#sub')).toBe('note');
  });

  it('should return empty string when linktext starts with hash', () => {
    expect(getLinkpath('#heading')).toBe('');
  });

  it('should return empty string for empty input', () => {
    expect(getLinkpath('')).toBe('');
  });
});

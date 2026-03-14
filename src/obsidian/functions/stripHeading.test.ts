import {
  describe,
  expect,
  it
} from 'vitest';

import { stripHeading } from './stripHeading.ts';

describe('stripHeading', () => {
  it('should strip leading hashes and space', () => {
    expect(stripHeading('## My Heading')).toBe('My Heading');
  });

  it('should return text without hashes unchanged', () => {
    expect(stripHeading('Plain text')).toBe('Plain text');
  });
});

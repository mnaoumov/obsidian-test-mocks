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

  it('should return text without special characters unchanged', () => {
    expect(stripHeading('Plain text')).toBe('Plain text');
  });

  it('should replace special characters with spaces and collapse whitespace', () => {
    expect(stripHeading('Foo: [bar] | baz?')).toBe('Foo bar baz');
  });

  it('should replace line breaks and trim', () => {
    expect(stripHeading('  a\r\nb\\c/d  ')).toBe('a b c d');
  });

  it('should keep hyphens, underscores and apostrophes', () => {
    expect(stripHeading('it\'s a-b_c')).toBe('it\'s a-b_c');
  });
});

import {
  describe,
  expect,
  it
} from 'vitest';

import { stripHeadingForLink } from './stripHeadingForLink.ts';

describe('stripHeadingForLink', () => {
  it('should strip hashes and link-unsafe characters', () => {
    expect(stripHeadingForLink('## Heading [with] brackets')).toBe('Heading with brackets');
  });

  it('should strip pipe and caret characters', () => {
    expect(stripHeadingForLink('## A|B^C')).toBe('ABC');
  });

  it('should strip backslash characters', () => {
    expect(stripHeadingForLink('## A\\B')).toBe('AB');
  });
});

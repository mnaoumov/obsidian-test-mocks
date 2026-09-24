import {
  describe,
  expect,
  it
} from 'vitest';

import { getFrontMatterInfo } from './getFrontMatterInfo.ts';

const MISSING = {
  contentStart: 0,
  exists: false,
  from: 0,
  frontmatter: '',
  to: 0
};

describe('getFrontMatterInfo', () => {
  it('should include the last property line newline in frontmatter and end to at the closing delimiter', () => {
    const content = '---\ntitle: Hello\n---\nBody';
    expect(getFrontMatterInfo(content)).toEqual({
      contentStart: 21,
      exists: true,
      from: 4,
      frontmatter: 'title: Hello\n',
      to: 17
    });
    expect(content.slice(17, 20)).toBe('---');
  });

  it('should keep a CRLF line ending inside frontmatter', () => {
    const content = '---\r\nabc\r\n---\r\nBody';
    expect(getFrontMatterInfo(content)).toEqual({
      contentStart: 15,
      exists: true,
      from: 5,
      frontmatter: 'abc\r\n',
      to: 10
    });
  });

  it('should splice [from, to) byte-exactly with text ending in a newline', () => {
    const content = '---\ntitle: Old\n---\nBody';
    const info = getFrontMatterInfo(content);
    const spliced = `${content.slice(0, info.from)}title: New\n${content.slice(info.to)}`;
    expect(spliced).toBe('---\ntitle: New\n---\nBody');
  });

  it('should detect an empty block', () => {
    expect(getFrontMatterInfo('---\n---\nBody')).toEqual({
      contentStart: 8,
      exists: true,
      from: 4,
      frontmatter: '',
      to: 4
    });
  });

  it('should handle a closing delimiter at the end of the file', () => {
    expect(getFrontMatterInfo('---\nkey: val\n---')).toEqual({
      contentStart: 16,
      exists: true,
      from: 4,
      frontmatter: 'key: val\n',
      to: 13
    });
  });

  it('should skip a delimiter that does not start a line', () => {
    const content = '---\nkey: ---\n---\nBody';
    expect(getFrontMatterInfo(content)).toEqual({
      contentStart: 17,
      exists: true,
      from: 4,
      frontmatter: 'key: ---\n',
      to: 13
    });
  });

  it('should return exists false when no frontmatter', () => {
    expect(getFrontMatterInfo('Just some text')).toEqual(MISSING);
  });

  it('should return exists false when the block is never closed', () => {
    expect(getFrontMatterInfo('---\nkey: val\nBody')).toEqual(MISSING);
  });
});

import {
  describe,
  expect,
  it
} from 'vitest';

import { getFrontMatterInfo } from './getFrontMatterInfo.ts';

describe('getFrontMatterInfo', () => {
  it('should detect frontmatter and return info', () => {
    const content = '---\ntitle: Hello\n---\nBody';
    const info = getFrontMatterInfo(content);
    expect(info.exists).toBe(true);
    expect(info.frontmatter).toBe('title: Hello');
    expect(info.contentStart).toBeGreaterThan(0);
  });

  it('should return correct from and to offsets', () => {
    const content = '---\nabc\n---\n';
    const info = getFrontMatterInfo(content);
    expect(info.exists).toBe(true);
    // "---\n" is 4 chars, from should be 4
    const FROM_OFFSET = 4;
    expect(info.from).toBe(FROM_OFFSET);
    // "abc" is 3 chars, to = from + 3 = 7
    const TO_OFFSET = 7;
    expect(info.to).toBe(TO_OFFSET);
  });

  it('should return exists false when no frontmatter', () => {
    const info = getFrontMatterInfo('Just some text');
    expect(info.exists).toBe(false);
    expect(info.contentStart).toBe(0);
    expect(info.frontmatter).toBe('');
  });

  it('should handle frontmatter at end of file without trailing newline', () => {
    const content = '---\nkey: val\n---';
    const info = getFrontMatterInfo(content);
    expect(info.exists).toBe(true);
    expect(info.frontmatter).toBe('key: val');
  });
});

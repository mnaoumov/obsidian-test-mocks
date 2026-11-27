import {
  describe,
  expect,
  it
} from 'vitest';

import { stripHeadingForLink } from './stripHeadingForLink.ts';

describe('stripHeadingForLink', () => {
  it('should match the obsidian.d.ts example', () => {
    expect(stripHeadingForLink('foo:#|^\\\r\n%%[[]]bar')).toBe('foo bar');
  });

  it('should turn a colon and a hash into spaces', () => {
    expect(stripHeadingForLink('Open questions: what #next?')).toBe('Open questions what next?');
  });

  it('should turn the leading hash markers into whitespace that is trimmed', () => {
    expect(stripHeadingForLink('## Heading')).toBe('Heading');
  });

  it('should keep a lone bracket but replace double brackets', () => {
    expect(stripHeadingForLink('A [b] [[c]]')).toBe('A [b] c');
  });

  it('should turn pipe, caret and backslash characters into spaces', () => {
    expect(stripHeadingForLink(String.raw`A|B^C\D`)).toBe('A B C D');
  });

  it('should turn line breaks and comment markers into spaces and collapse whitespace', () => {
    expect(stripHeadingForLink('A\r\nB\n%%C%%  \tD')).toBe('A B C D');
  });
});

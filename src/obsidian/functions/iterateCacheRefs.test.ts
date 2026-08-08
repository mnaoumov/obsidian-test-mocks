import type { ReferenceCache } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { iterateCacheRefs } from './iterateCacheRefs.ts';

function makeRef(link: string): ReferenceCache {
  return {
    displayText: link,
    link,
    original: `[[${link}]]`,
    position: {
      end: { col: 0, line: 0, offset: 0 },
      start: { col: 0, line: 0, offset: 0 }
    }
  };
}

describe('iterateCacheRefs', () => {
  it('should iterate over links', () => {
    const links = [makeRef('link1')];
    const visited: string[] = [];
    iterateCacheRefs({ links }, (ref) => {
      visited.push(ref.link);
    });
    expect(visited).toEqual(['link1']);
  });

  it('should iterate over embeds', () => {
    const embeds = [makeRef('embed1')];
    const visited: string[] = [];
    iterateCacheRefs({ embeds }, (ref) => {
      visited.push(ref.link);
    });
    expect(visited).toEqual(['embed1']);
  });

  it('should return true when callback returns true for a link', () => {
    const links = [makeRef('a')];
    const isResult = iterateCacheRefs({ links }, () => true);
    expect(isResult).toBe(true);
  });

  it('should return true when callback returns true for an embed', () => {
    const embeds = [makeRef('a')];
    const isResult = iterateCacheRefs({ embeds }, () => true);
    expect(isResult).toBe(true);
  });

  it('should return false when cache has no links or embeds', () => {
    const isResult = iterateCacheRefs({}, () => true);
    expect(isResult).toBe(false);
  });

  it('should check links before embeds', () => {
    const links = [makeRef('link')];
    const embeds = [makeRef('embed')];
    const isResult = iterateCacheRefs({ embeds, links }, () => true);
    expect(isResult).toBe(true);
  });
});

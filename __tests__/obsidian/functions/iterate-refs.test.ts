import type { ReferenceCache } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { iterateCacheRefs } from '../../../src/obsidian/functions/iterateCacheRefs.ts';
import { iterateRefs } from '../../../src/obsidian/functions/iterateRefs.ts';

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

describe('iterateRefs', () => {
  it('should return false when no callback returns true', () => {
    const refs = [makeRef('a'), makeRef('b')];
    const result = iterateRefs(refs, () => undefined);
    expect(result).toBe(false);
  });

  it('should return true when callback returns true', () => {
    const refs = [makeRef('a'), makeRef('b')];
    const result = iterateRefs(refs, (ref) => ref.link === 'a');
    expect(result).toBe(true);
  });

  it('should stop iteration when callback returns true', () => {
    const refs = [makeRef('a'), makeRef('b'), makeRef('c')];
    const visited: string[] = [];
    iterateRefs(refs, (ref) => {
      visited.push(ref.link);
      return ref.link === 'b';
    });
    expect(visited).toEqual(['a', 'b']);
  });
});

describe('iterateCacheRefs', () => {
  it('should iterate over links', () => {
    const links = [makeRef('link1')];
    const visited: string[] = [];
    iterateCacheRefs({ links }, (ref) => {
      visited.push(ref.link);
      return undefined;
    });
    expect(visited).toEqual(['link1']);
  });

  it('should iterate over embeds', () => {
    const embeds = [makeRef('embed1')];
    const visited: string[] = [];
    iterateCacheRefs({ embeds }, (ref) => {
      visited.push(ref.link);
      return undefined;
    });
    expect(visited).toEqual(['embed1']);
  });

  it('should return true when callback returns true for a link', () => {
    const links = [makeRef('a')];
    const result = iterateCacheRefs({ links }, () => true);
    expect(result).toBe(true);
  });

  it('should return true when callback returns true for an embed', () => {
    const embeds = [makeRef('a')];
    const result = iterateCacheRefs({ embeds }, () => true);
    expect(result).toBe(true);
  });

  it('should return false when cache has no links or embeds', () => {
    const result = iterateCacheRefs({}, () => true);
    expect(result).toBe(false);
  });

  it('should check links before embeds', () => {
    const links = [makeRef('link')];
    const embeds = [makeRef('embed')];
    const result = iterateCacheRefs({ embeds, links }, () => true);
    expect(result).toBe(true);
  });

  it('should throw when ref is missing position property', () => {
    const links = [{ displayText: 'a', link: 'a', original: '[[a]]' }];
    expect(() => {
      iterateCacheRefs({ links: links as unknown as ReferenceCache[] }, () => undefined);
    }).toThrow('Should be ReferenceCache, but position property is missing');
  });
});

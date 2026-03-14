import type { ReferenceCache } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { iterateRefs } from './iterateRefs.ts';

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

import type { BasesPropertyId } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { castTo } from '../../internal/cast.ts';
import { parsePropertyId } from './parsePropertyId.ts';

describe('parsePropertyId', () => {
  it('should parse a property ID without a dot', () => {
    const result = parsePropertyId(castTo<BasesPropertyId>('text'));
    expect(result.name).toBe('text');
    expect(result.type).toBe('text');
  });

  it('should parse a property ID with a dot', () => {
    const result = parsePropertyId(castTo<BasesPropertyId>('number.count'));
    expect(result.name).toBe('count');
    expect(result.type).toBe('number');
  });
});

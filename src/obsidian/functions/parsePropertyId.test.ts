import type { BasesPropertyId } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { parsePropertyId } from './parsePropertyId.ts';

describe('parsePropertyId', () => {
  it('should parse type and name from property ID', () => {
    const id: BasesPropertyId = 'note.title';
    const result = parsePropertyId(id);
    expect(result.name).toBe('title');
    expect(result.type).toBe('note');
  });

  it('should handle formula property type', () => {
    const id: BasesPropertyId = 'formula.sum';
    const result = parsePropertyId(id);
    expect(result.name).toBe('sum');
    expect(result.type).toBe('formula');
  });

  it('should handle file property type', () => {
    const id: BasesPropertyId = 'file.name';
    const result = parsePropertyId(id);
    expect(result.name).toBe('name');
    expect(result.type).toBe('file');
  });

  it('should handle names containing dots', () => {
    const id: BasesPropertyId = 'note.my.dotted.name';
    const result = parsePropertyId(id);
    expect(result.name).toBe('my.dotted.name');
    expect(result.type).toBe('note');
  });
});

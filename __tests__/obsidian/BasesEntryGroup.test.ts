import type { TFile } from 'obsidian';

import { describe, expect, it } from 'vitest';

import {
  BasesEntry,
  BasesEntryGroup,
  StringValue
} from 'obsidian';

describe('BasesEntryGroup', () => {
  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const group = BasesEntryGroup.create__([]);
    expect(group).toBeInstanceOf(BasesEntryGroup);
  });

  it('should store entries', () => {
    const entry = BasesEntry.create__(mockFile);
    const group = BasesEntryGroup.create__([entry]);
    expect(group.entries).toEqual([entry]);
  });

  it('should not have key when created without one', () => {
    const group = BasesEntryGroup.create__([]);
    expect(group.hasKey()).toBe(false);
  });

  it('should have key when created with one', () => {
    const key = new StringValue('group1');
    const group = BasesEntryGroup.create__([], key);
    expect(group.hasKey()).toBe(true);
    expect(group.key).toBe(key);
  });

  it('should leave key as undefined when not provided', () => {
    const group = BasesEntryGroup.create__([]);
    expect(group.key).toBeUndefined();
  });
});

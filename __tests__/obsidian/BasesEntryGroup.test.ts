import {
  describe,
  expect,
  it
} from 'vitest';

import type { TFile } from '../../src/obsidian/TFile.ts';

import { BasesEntry } from '../../src/obsidian/BasesEntry.ts';
import { BasesEntryGroup } from '../../src/obsidian/BasesEntryGroup.ts';
import { StringValue } from '../../src/obsidian/StringValue.ts';

describe('BasesEntryGroup', () => {
  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const group = BasesEntryGroup.create__([], undefined);
    expect(group).toBeInstanceOf(BasesEntryGroup);
  });

  it('should store entries', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    const group = BasesEntryGroup.create__([entry], undefined);
    expect(group.entries).toEqual([entry]);
  });

  it('should not have key when created without one', () => {
    const group = BasesEntryGroup.create__([], undefined);
    expect(group.hasKey()).toBe(false);
  });

  it('should have key when created with one', () => {
    const key = new StringValue('group1');
    const group = BasesEntryGroup.create__([], key);
    expect(group.hasKey()).toBe(true);
    expect(group.key).toBe(key);
  });

  it('should leave key as undefined when not provided', () => {
    const group = BasesEntryGroup.create__([], undefined);
    expect(group.key).toBeUndefined();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const group = BasesEntryGroup.create__([], undefined);
      const original = group.asOriginalType__();
      expect(original).toBe(group);
    });
  });
});

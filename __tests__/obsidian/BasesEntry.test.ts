import type { BasesPropertyId } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { TFile } from '../../src/obsidian/TFile.ts';

import { BasesEntry } from '../../src/obsidian/BasesEntry.ts';
import { StringValue } from '../../src/obsidian/StringValue.ts';

describe('BasesEntry', () => {
  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const entry = BasesEntry.create__(mockFile);
    expect(entry).toBeInstanceOf(BasesEntry);
  });

  it('should store the file reference', () => {
    const entry = BasesEntry.create__(mockFile);
    expect(entry.file).toBe(mockFile);
  });

  it('should return null for unset property', () => {
    const entry = BasesEntry.create__(mockFile);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBeNull();
  });

  it('should return value set via setValue__', () => {
    const entry = BasesEntry.create__(mockFile);
    const value = new StringValue('test');
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing mock-only API
    entry.setValue__('prop.name' as BasesPropertyId, value);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBe(value);
  });

  it('should allow setting null values', () => {
    const entry = BasesEntry.create__(mockFile);
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing mock-only API
    entry.setValue__('prop.name' as BasesPropertyId, null);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBeNull();
  });
});

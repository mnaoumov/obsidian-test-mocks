import type { BasesPropertyId } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { TFile } from './TFile.ts';

import { BasesEntry } from './BasesEntry.ts';
import { StringValue } from './StringValue.ts';

describe('BasesEntry', () => {
  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    expect(entry).toBeInstanceOf(BasesEntry);
  });

  it('should store the file reference', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    expect(entry.file).toBe(mockFile);
  });

  it('should return null for unset property', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBeNull();
  });

  it('should return value set via setValue__', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    const value = new StringValue('test');

    entry.setValue__('prop.name' as BasesPropertyId, value);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBe(value);
  });

  it('should allow setting null values', () => {
    const entry = BasesEntry.create__(undefined, mockFile);

    entry.setValue__('prop.name' as BasesPropertyId, null);
    expect(entry.getValue('prop.name' as BasesPropertyId)).toBeNull();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const entry = BasesEntry.create__(undefined, mockFile);
      const original = entry.asOriginalType__();
      expect(original).toBe(entry);
    });
  });
});

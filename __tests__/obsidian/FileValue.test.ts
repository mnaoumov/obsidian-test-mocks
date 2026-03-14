import type { DataAdapter } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';
import { FileValue } from '../../src/obsidian/FileValue.ts';
import { TFile } from '../../src/obsidian/TFile.ts';
import { Vault } from '../../src/obsidian/Vault.ts';

describe('FileValue', () => {
  function createFileValue(): FileValue {
    const adapter = FileSystemAdapter.create__('/mock') as unknown as DataAdapter;
    const app = App.create__(adapter, '');
    const vault = Vault.create2__(adapter);
    const file = TFile.create__(vault, 'test.md');
    return new FileValue(app, file);
  }

  it('should always be truthy', () => {
    const val = createFileValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = createFileValue();
    expect(String(val)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const adapter = FileSystemAdapter.create__('/mock') as unknown as DataAdapter;
      const app = App.create__(adapter, '');
      const vault = Vault.create2__(adapter);
      const file = TFile.create__(vault, 'test.md');
      const val = FileValue.create__(app, file);
      expect(val).toBeInstanceOf(FileValue);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const val = createFileValue();
      const original = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});

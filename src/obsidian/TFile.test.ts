import type { TFile as TFileOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { TFile } from './TFile.ts';
import { Vault } from './Vault.ts';

function createVault(): Vault {
  return Vault.create2__(FileSystemAdapter.create__('/mock-vault').asOriginalType__());
}

describe('TFile', () => {
  it('should create an instance via create__', () => {
    const vault = createVault();
    const file = TFile.create__(vault, 'folder/note.md');
    expect(file).toBeInstanceOf(TFile);
  });

  it('should throw when accessing an unmocked property', () => {
    const vault = createVault();
    const file = TFile.create__(vault, 'note.md');
    const record = ensureGenericObject(file);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in TFile'
    );
  });

  it('should extract basename and extension from path', () => {
    const vault = createVault();
    const file = TFile.create__(vault, 'folder/note.md');
    expect(file.basename).toBe('note');
    expect(file.extension).toBe('md');
    expect(file.name).toBe('note.md');
  });

  it('should handle files without extension', () => {
    const vault = createVault();
    const file = TFile.create__(vault, 'folder/README');
    expect(file.basename).toBe('README');
    expect(file.extension).toBe('');
  });

  it('should have default stat values', () => {
    const vault = createVault();
    const file = TFile.create__(vault, 'note.md');
    expect(file.stat).toEqual({ ctime: 0, mtime: 0, size: 0 });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const vault = createVault();
      const file = TFile.create__(vault, 'note.md');
      const original: TFileOriginal = file.asOriginalType2__();
      expect(original).toBe(file);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const vault = createVault();
      const file = TFile.create__(vault, 'note.md');
      const mock = TFile.fromOriginalType2__(file.asOriginalType2__());
      expect(mock).toBe(file);
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const vault = createVault();
      const file = TFile.create__(vault, 'note.md');
      expect(() => {
        file.constructor2__(vault, 'note.md');
      }).not.toThrow();
    });
  });
});

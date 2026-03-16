import type { TFolder as TFolderOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { TFolder } from './TFolder.ts';
import { Vault } from './Vault.ts';

function createVault(): Vault {
  return Vault.create2__(FileSystemAdapter.create__('/mock-vault').asOriginalType__());
}

describe('TFolder', () => {
  it('should create an instance via create__', () => {
    const vault = createVault();
    const folder = TFolder.create__(vault, 'my-folder');
    expect(folder).toBeInstanceOf(TFolder);
  });

  it('should throw when accessing an unmocked property', () => {
    const vault = createVault();
    const folder = TFolder.create__(vault, 'my-folder');
    const record = ensureGenericObject(folder);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in TFolder'
    );
  });

  it('should have an empty children array by default', () => {
    const vault = createVault();
    const folder = TFolder.create__(vault, 'my-folder');
    expect(folder.children).toEqual([]);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, 'my-folder');
      const original: TFolderOriginal = folder.asOriginalType2__();
      expect(original).toBe(folder);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, 'my-folder');
      const mock = TFolder.fromOriginalType2__(folder.asOriginalType2__());
      expect(mock).toBe(folder);
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, 'my-folder');
      expect(() => {
        folder.constructor2__(vault, 'my-folder');
      }).not.toThrow();
    });
  });

  describe('isRoot', () => {
    it('should return true for empty path', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, '');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return true for slash path', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, '/');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return false for non-root path', () => {
      const vault = createVault();
      const folder = TFolder.create__(vault, 'my-folder');
      expect(folder.isRoot()).toBe(false);
    });
  });
});

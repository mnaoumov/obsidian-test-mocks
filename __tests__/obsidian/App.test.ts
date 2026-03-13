import type { App as AppOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';

describe('App', () => {
  it('should create an instance via createConfigured__', async () => {
    const app = await App.createConfigured__();
    expect(app).toBeInstanceOf(App);
  });

  it('should create folders for paths ending with /', async () => {
    const app = await App.createConfigured__({
      files: {
        'archive/2023/': ''
      }
    });
    const folder = app.vault.getAbstractFileByPath('archive/2023');
    expect(folder).not.toBeNull();
    expect(folder?.constructor.name).toBe('TFolder');
  });

  it('should create parent folders for folder paths ending with /', async () => {
    const app = await App.createConfigured__({
      files: {
        'a/b/c/': ''
      }
    });
    expect(app.vault.getAbstractFileByPath('a')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('a/b')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('a/b/c')).not.toBeNull();
  });

  it('should throw when folder path has non-empty content', async () => {
    await expect(App.createConfigured__({
      files: {
        'folder/': 'non-empty'
      }
    })).rejects.toThrow('Folder path "folder/" must have empty content');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const app = await App.createConfigured__();
      const original: AppOriginal = app.asOriginalType__();
      expect(original).toBe(app);
    });

    it('should throw when accessing an unmocked property', async () => {
      const app = await App.createConfigured__();
      const record = app as unknown as Record<string, unknown>;
      expect(() => record['nonExistentProperty']).toThrow(
        'Property "nonExistentProperty" is not mocked in App. To override, assign a value first: mock.nonExistentProperty = ...'
      );
    });

    it('should allow accessing a property after assigning it', async () => {
      const app = await App.createConfigured__();
      const record = app as unknown as Record<string, unknown>;
      const mockValue = { test: true };
      record['customProperty'] = mockValue;
      expect(record['customProperty']).toBe(mockValue);
    });
  });
});

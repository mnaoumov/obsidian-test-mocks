import type {
  App as AppOriginal,
  DataAdapter
} from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';

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

  it('should create an instance via create__', () => {
    const adapter = FileSystemAdapter.create__('/mock') as unknown as DataAdapter;
    const app = App.create__(adapter, 'test-id');
    expect(app).toBeInstanceOf(App);
  });

  it('should use provided adapter in createConfigured__', async () => {
    const adapter = FileSystemAdapter.create__('/custom');
    const app = await App.createConfigured__({ adapter });
    expect(app).toBeInstanceOf(App);
  });

  it('should set insensitive on adapter when isAdapterCaseInsensitive is true', async () => {
    const app = await App.createConfigured__({ isAdapterCaseInsensitive: true });
    expect(app).toBeInstanceOf(App);
  });

  it('should create files with parent folders', async () => {
    const app = await App.createConfigured__({
      files: {
        'deeply/nested/file.md': 'content'
      }
    });
    expect(app.vault.getAbstractFileByPath('deeply')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('deeply/nested')).not.toBeNull();
    expect(app.vault.getFileByPath('deeply/nested/file.md')).not.toBeNull();
  });

  it('should create files at root level without parent folder', async () => {
    const app = await App.createConfigured__({
      files: {
        'root-file.md': 'content'
      }
    });
    expect(app.vault.getFileByPath('root-file.md')).not.toBeNull();
  });

  describe('isDarkMode', () => {
    it('should return false', async () => {
      const app = await App.createConfigured__();
      expect(app.isDarkMode()).toBe(false);
    });
  });

  describe('loadLocalStorage / saveLocalStorage', () => {
    it('should return null for unset keys', async () => {
      const app = await App.createConfigured__();
      expect(app.loadLocalStorage('missing')).toBeNull();
    });

    it('should return saved values', async () => {
      const app = await App.createConfigured__();
      app.saveLocalStorage('key', 'value');
      expect(app.loadLocalStorage('key')).toBe('value');
    });
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

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const mock = App.fromOriginalType__(app.asOriginalType__());
      expect(mock).toBe(app);
    });
  });
});

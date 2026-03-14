import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';

describe('FileSystemAdapter', () => {
  function createAdapter(): FileSystemAdapter {
    return FileSystemAdapter.create__('/mock-vault');
  }

  it('should create an instance via create__', () => {
    const adapter = createAdapter();
    expect(adapter).toBeInstanceOf(FileSystemAdapter);
  });

  it('should throw when accessing an unmocked property', () => {
    const adapter = createAdapter();
    const record = adapter as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in FileSystemAdapter. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const adapter = createAdapter();
      const original: FileSystemAdapterOriginal = adapter.asOriginalType__();
      expect(original).toBe(adapter);
    });
  });

  describe('getBasePath', () => {
    it('should return the base path', () => {
      const adapter = createAdapter();
      expect(adapter.getBasePath()).toBe('/mock-vault');
    });
  });

  describe('getFilePath', () => {
    it('should return base path joined with normalized path', () => {
      const adapter = createAdapter();
      expect(adapter.getFilePath('notes/file.md')).toBe('/mock-vault/notes/file.md');
    });
  });

  describe('inherited InMemoryAdapter methods', () => {
    it('should write and read text files', async () => {
      const adapter = createAdapter();
      await adapter.write('test.md', 'content');
      const content = await adapter.read('test.md');
      expect(content).toBe('content');
    });

    it('should throw when reading non-existent file', async () => {
      const adapter = createAdapter();
      await expect(adapter.read('missing.md')).rejects.toThrow('File not found: missing.md');
    });
  });
});

import type { FileSystemAdapter as FileSystemAdapterOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';

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
    const record = ensureGenericObject(adapter);
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

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const adapter = createAdapter();
      const mock = FileSystemAdapter.fromOriginalType__(adapter.asOriginalType__());
      expect(mock).toBe(adapter);
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

  describe('getFullPath', () => {
    it('should return base path joined with normalized path', () => {
      const adapter = createAdapter();
      expect(adapter.getFullPath('notes/file.md')).toBe('/mock-vault/notes/file.md');
    });
  });

  describe('copy', () => {
    it('should refuse to copy a file into a missing folder, as fs.copyFile does', async () => {
      const adapter = createAdapter();
      await adapter.write('source.md', 'data');

      await expect(adapter.copy('source.md', 'Q/R/dest.md')).rejects.toThrow(
        'ENOENT: no such file or directory, copyfile \'/mock-vault/source.md\' -> \'/mock-vault/Q/R/dest.md\''
      );
      expect(await adapter.exists('Q')).toBe(false);
    });

    it('should copy a file into an existing folder', async () => {
      const adapter = createAdapter();
      await adapter.write('source.md', 'data');
      await adapter.mkdir('Q');
      await adapter.copy('source.md', 'Q/dest.md');

      expect(await adapter.read('Q/dest.md')).toBe('data');
    });

    it('should copy a file to the vault root', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');
      await adapter.write('dir/source.md', 'data');
      await adapter.copy('dir/source.md', 'dest.md');

      expect(await adapter.read('dest.md')).toBe('data');
    });

    it('should create the missing parents of a copied folder, as a recursive mkdir does', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('src');
      await adapter.write('src/a.md', 'A');
      await adapter.copy('src', 'Q/R/dest');

      expect(await adapter.read('Q/R/dest/a.md')).toBe('A');
    });

    it('should report a missing source rather than a missing destination folder', async () => {
      const adapter = createAdapter();

      await expect(adapter.copy('missing.md', 'Q/dest.md')).rejects.toThrow('File not found: missing.md');
    });
  });

  describe('rmdir', () => {
    it('should refuse a non-recursive removal of a non-empty folder with EISDIR', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');
      await adapter.write('dir/a.md', 'data');

      await expect(adapter.rmdir('dir', false)).rejects.toThrow('Path is a directory: rm returned EISDIR (is a directory) /mock-vault/dir');
      expect(await adapter.read('dir/a.md')).toBe('data');
    });

    it('should refuse a non-recursive removal of an EMPTY folder too', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');

      await expect(adapter.rmdir('dir', false)).rejects.toThrow('Path is a directory: rm returned EISDIR (is a directory) /mock-vault/dir');
      expect(await adapter.exists('dir')).toBe(true);
    });

    it('should throw ENOENT for a missing path, recursive or not', async () => {
      const adapter = createAdapter();

      await expect(adapter.rmdir('NOPE', false)).rejects.toThrow('ENOENT: no such file or directory, lstat \'/mock-vault/NOPE\'');
      await expect(adapter.rmdir('NOPE', true)).rejects.toThrow('ENOENT: no such file or directory, lstat \'/mock-vault/NOPE\'');
    });

    it('should remove a folder recursively', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');
      await adapter.write('dir/a.md', 'data');
      await adapter.rmdir('dir', true);

      expect(await adapter.exists('dir')).toBe(false);
      expect(await adapter.exists('dir/a.md')).toBe(false);
    });
  });

  describe('writing into a missing folder', () => {
    it('should refuse to write a text file with ENOENT, as fs.writeFile does', async () => {
      const adapter = createAdapter();
      await expect(adapter.write('missing/a.md', 'data')).rejects.toThrow(
        'ENOENT: no such file or directory, open \'/mock-vault/missing/a.md\''
      );
      expect(await adapter.exists('missing/a.md')).toBe(false);
      expect(await adapter.exists('missing')).toBe(false);
    });

    it('should refuse to write a binary file with ENOENT, as fs.writeFile does', async () => {
      const adapter = createAdapter();
      await expect(adapter.writeBinary('missing/a.bin', new ArrayBuffer(1))).rejects.toThrow(
        'ENOENT: no such file or directory, open \'/mock-vault/missing/a.bin\''
      );
      expect(await adapter.exists('missing')).toBe(false);
    });

    it('should refuse to append text with ENOENT, as fs.appendFile does', async () => {
      const adapter = createAdapter();
      await expect(adapter.append('missing/a.md', 'data')).rejects.toThrow(
        'ENOENT: no such file or directory, open \'/mock-vault/missing/a.md\''
      );
      expect(await adapter.exists('missing')).toBe(false);
    });

    it('should refuse to append bytes with ENOENT, as fs.appendFile does', async () => {
      const adapter = createAdapter();
      await expect(adapter.appendBinary('missing/a.bin', new ArrayBuffer(1))).rejects.toThrow(
        'ENOENT: no such file or directory, open \'/mock-vault/missing/a.bin\''
      );
      expect(await adapter.exists('missing')).toBe(false);
    });

    it('should refuse with ENOTDIR when a file sits where the folder would be', async () => {
      const adapter = createAdapter();
      await adapter.write('note.md', 'data');
      await expect(adapter.write('note.md/a.md', 'data')).rejects.toThrow(
        'ENOTDIR: not a directory, open \'/mock-vault/note.md/a.md\''
      );
    });

    it('should write into a folder that exists, the vault root included', async () => {
      const adapter = createAdapter();
      await adapter.write('root.md', 'root');
      await adapter.mkdir('a/b');
      await adapter.writeBinary('a/b/c.bin', new ArrayBuffer(2));
      await adapter.append('a/b/d.md', 'd');
      await adapter.appendBinary('a/e.bin', new ArrayBuffer(1));
      expect(await adapter.read('root.md')).toBe('root');
      expect(await adapter.exists('a/b/c.bin')).toBe(true);
      expect(await adapter.read('a/b/d.md')).toBe('d');
      expect(await adapter.exists('a/e.bin')).toBe(true);
    });
  });

  describe('readLocalFile', () => {
    it('should resolve to an ArrayBuffer', async () => {
      const buffer = await FileSystemAdapter.readLocalFile('any/path');
      expect(buffer).toBeInstanceOf(ArrayBuffer);
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

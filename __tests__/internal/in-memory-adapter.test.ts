import {
  describe,
  expect,
  it
} from 'vitest';

import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';

const TIMESTAMP_A = 1000;
const TIMESTAMP_B = 2000;
const TIMESTAMP_C = 100;
const TIMESTAMP_D = 200;

function createAdapter(): FileSystemAdapter {
  return FileSystemAdapter.create__('/vault');
}

describe('InMemoryAdapter', () => {
  describe('append()', () => {
    it('should create a new file when appending to a non-existent path', async () => {
      const adapter = createAdapter();
      await adapter.append('log.txt', 'first');

      expect(await adapter.read('log.txt')).toBe('first');
    });

    it('should append to an existing file', async () => {
      const adapter = createAdapter();
      await adapter.write('log.txt', 'abc');
      await adapter.append('log.txt', 'def');

      expect(await adapter.read('log.txt')).toBe('abcdef');
    });

    it('should update stat size after append', async () => {
      const adapter = createAdapter();
      await adapter.write('log.txt', 'abc');
      await adapter.append('log.txt', 'def');
      const stat = await adapter.stat('log.txt');

      expect(stat?.size).toBe('abcdef'.length);
    });

    it('should respect ctime option', async () => {
      const adapter = createAdapter();
      await adapter.append('log.txt', 'data', { ctime: TIMESTAMP_A, mtime: TIMESTAMP_B });
      const stat = await adapter.stat('log.txt');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
      expect(stat?.mtime).toBe(TIMESTAMP_B);
    });

    it('should preserve existing ctime when not specified in options', async () => {
      const adapter = createAdapter();
      await adapter.append('log.txt', 'first', { ctime: TIMESTAMP_A, mtime: TIMESTAMP_B });
      await adapter.append('log.txt', 'second');
      const stat = await adapter.stat('log.txt');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
    });

    it('should create parent directories', async () => {
      const adapter = createAdapter();
      await adapter.append('a/b/c.txt', 'data');

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
    });
  });

  describe('appendBinary()', () => {
    it('should create a new binary file when appending to a non-existent path', async () => {
      const adapter = createAdapter();
      const data = Uint8Array.of(1).buffer;
      await adapter.appendBinary('data.bin', data);

      const result = new Uint8Array(await adapter.readBinary('data.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should concatenate binary data', async () => {
      const adapter = createAdapter();
      await adapter.appendBinary('data.bin', Uint8Array.of(1).buffer);
      await adapter.appendBinary('data.bin', Uint8Array.of(0).buffer);

      const result = new Uint8Array(await adapter.readBinary('data.bin'));
      expect(Array.from(result)).toEqual([1, 0]);
    });

    it('should respect ctime and mtime options', async () => {
      const adapter = createAdapter();
      await adapter.appendBinary('data.bin', Uint8Array.of(1).buffer, { ctime: TIMESTAMP_A, mtime: TIMESTAMP_B });
      const stat = await adapter.stat('data.bin');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
      expect(stat?.mtime).toBe(TIMESTAMP_B);
    });

    it('should preserve existing ctime when not specified in options', async () => {
      const adapter = createAdapter();
      await adapter.appendBinary('data.bin', Uint8Array.of(1).buffer, { ctime: TIMESTAMP_A, mtime: TIMESTAMP_B });
      await adapter.appendBinary('data.bin', Uint8Array.of(0).buffer);
      const stat = await adapter.stat('data.bin');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
    });

    it('should create parent directories', async () => {
      const adapter = createAdapter();
      await adapter.appendBinary('a/b/data.bin', Uint8Array.of(1).buffer);

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
    });
  });

  describe('copy()', () => {
    it('should copy a text file', async () => {
      const adapter = createAdapter();
      await adapter.write('source.md', 'hello');
      await adapter.copy('source.md', 'dest.md');

      expect(await adapter.read('dest.md')).toBe('hello');
      expect(await adapter.read('source.md')).toBe('hello');
    });

    it('should copy a binary file', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('source.bin', Uint8Array.of(1).buffer);
      await adapter.copy('source.bin', 'dest.bin');

      const result = new Uint8Array(await adapter.readBinary('dest.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should throw when copying a non-existent file', async () => {
      const adapter = createAdapter();

      await expect(adapter.copy('missing.md', 'dest.md')).rejects.toThrow('File not found: missing.md');
    });

    it('should create parent directories for the destination', async () => {
      const adapter = createAdapter();
      await adapter.write('source.md', 'data');
      await adapter.copy('source.md', 'dir/dest.md');

      expect(await adapter.exists('dir')).toBe(true);
    });
  });

  describe('exists()', () => {
    it('should find a text file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');

      expect(await adapter.exists('file.md')).toBe(true);
    });

    it('should find a binary file', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('file.bin', new ArrayBuffer(0));

      expect(await adapter.exists('file.bin')).toBe(true);
    });

    it('should find a directory', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('folder');

      expect(await adapter.exists('folder')).toBe(true);
    });

    it('should return false for a non-existent path', async () => {
      const adapter = createAdapter();

      expect(await adapter.exists('missing')).toBe(false);
    });

    it('should find the root directory', async () => {
      const adapter = createAdapter();

      expect(await adapter.exists('')).toBe(true);
    });
  });

  describe('exists() with sensitive parameter', () => {
    it('should find exact match when sensitive is true', async () => {
      const adapter = createAdapter();
      await adapter.write('Notes/File.md', 'content');

      expect(await adapter.exists('Notes/File.md', true)).toBe(true);
    });

    it('should not find case-mismatched path when sensitive is true', async () => {
      const adapter = createAdapter();
      await adapter.write('Notes/File.md', 'content');

      expect(await adapter.exists('notes/file.md', true)).toBe(false);
    });

    it('should not find case-mismatched path when sensitive is true even on insensitive adapter', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Notes/File.md', 'content');

      expect(await adapter.exists('notes/file.md', true)).toBe(false);
    });

    it('should find case-mismatched text file on insensitive adapter without sensitive flag', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Notes/File.md', 'content');

      expect(await adapter.exists('notes/file.md')).toBe(true);
    });

    it('should find case-mismatched binary file on insensitive adapter', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.writeBinary('Data/Image.PNG', new ArrayBuffer(0));

      expect(await adapter.exists('data/image.png')).toBe(true);
    });

    it('should find case-mismatched directory on insensitive adapter', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.mkdir('Notes');

      expect(await adapter.exists('notes')).toBe(true);
    });

    it('should not find case-mismatched path on case-sensitive adapter (default)', async () => {
      const adapter = createAdapter();
      await adapter.write('Notes/File.md', 'content');

      expect(await adapter.exists('notes/file.md')).toBe(false);
    });

    it('should track lowercase keys after append', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.append('Notes/Log.txt', 'line1');

      expect(await adapter.exists('notes/log.txt')).toBe(true);
    });

    it('should track lowercase keys after appendBinary', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.appendBinary('Data/Chunk.bin', new ArrayBuffer(0));

      expect(await adapter.exists('data/chunk.bin')).toBe(true);
    });

    it('should track lowercase keys after copy', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Original.md', 'content');
      await adapter.copy('Original.md', 'Copy/Backup.md');

      expect(await adapter.exists('copy/backup.md')).toBe(true);
    });

    it('should update lowercase keys after remove', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Notes/File.md', 'content');
      await adapter.remove('Notes/File.md');

      expect(await adapter.exists('notes/file.md')).toBe(false);
    });

    it('should update lowercase keys after rename', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Old.md', 'content');
      await adapter.rename('Old.md', 'New.md');

      expect(await adapter.exists('old.md')).toBe(false);
      expect(await adapter.exists('new.md')).toBe(true);
    });

    it('should update lowercase keys after rmdir', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.mkdir('TempDir');
      await adapter.write('TempDir/file.txt', 'data');
      await adapter.rmdir('TempDir', true);

      expect(await adapter.exists('tempdir')).toBe(false);
    });

    it('should find parent directories case-insensitively', async () => {
      const adapter = createAdapter();
      adapter.insensitive__ = true;
      await adapter.write('Deeply/Nested/Path/File.md', 'content');

      expect(await adapter.exists('deeply')).toBe(true);
      expect(await adapter.exists('deeply/nested')).toBe(true);
      expect(await adapter.exists('DEEPLY/NESTED/PATH')).toBe(true);
    });
  });

  describe('getFilePath()', () => {
    it('should return basePath joined with the normalized path', () => {
      const adapter = createAdapter();

      expect(adapter.getFilePath('notes/file.md')).toBe('/vault/notes/file.md');
    });
  });

  describe('getName()', () => {
    it('should return mock-vault', () => {
      const adapter = createAdapter();

      expect(adapter.getName()).toBe('mock-vault');
    });
  });

  describe('getResourcePath()', () => {
    it('should return app://local/ prefixed path', () => {
      const adapter = createAdapter();

      expect(adapter.getResourcePath('img.png')).toBe('app://local/img.png');
    });
  });

  describe('list()', () => {
    it('should list direct children files and folders at root', async () => {
      const adapter = createAdapter();
      await adapter.write('a.md', 'data');
      await adapter.write('b.md', 'data');
      await adapter.mkdir('folder');

      const result = await adapter.list('');
      expect(result.files).toContain('a.md');
      expect(result.files).toContain('b.md');
      expect(result.folders).toContain('folder');
    });

    it('should list direct children under a subdirectory', async () => {
      const adapter = createAdapter();
      await adapter.write('dir/child.md', 'data');
      await adapter.write('dir/sub/nested.md', 'data');

      const result = await adapter.list('dir');
      expect(result.files).toContain('dir/child.md');
      expect(result.folders).toContain('dir/sub');
      expect(result.files).not.toContain('dir/sub/nested.md');
    });

    it('should return empty arrays for an empty directory', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('empty');

      const result = await adapter.list('empty');
      expect(result.files).toEqual([]);
      expect(result.folders).toEqual([]);
    });

    it('should include binary files', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('data.bin', new ArrayBuffer(0));

      const result = await adapter.list('');
      expect(result.files).toContain('data.bin');
    });
  });

  describe('mkdir()', () => {
    it('should create a directory', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('new-dir');

      expect(await adapter.exists('new-dir')).toBe(true);
    });

    it('should create parent directories', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('a/b/c');

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
      expect(await adapter.exists('a/b/c')).toBe(true);
    });
  });

  describe('process()', () => {
    it('should read, transform, and write a file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'hello');
      const result = await adapter.process('file.md', (data) => data.toUpperCase());

      expect(result).toBe('HELLO');
      expect(await adapter.read('file.md')).toBe('HELLO');
    });

    it('should throw when processing a non-existent file', async () => {
      const adapter = createAdapter();

      await expect(adapter.process('missing.md', (d) => d)).rejects.toThrow('File not found: missing.md');
    });
  });

  describe('read()', () => {
    it('should return file content', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'content');

      expect(await adapter.read('file.md')).toBe('content');
    });

    it('should throw for a non-existent file', async () => {
      const adapter = createAdapter();

      await expect(adapter.read('missing.md')).rejects.toThrow('File not found: missing.md');
    });
  });

  describe('readBinary()', () => {
    it('should return binary content', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('data.bin', Uint8Array.of(1).buffer);

      const result = new Uint8Array(await adapter.readBinary('data.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should throw for a non-existent file', async () => {
      const adapter = createAdapter();

      await expect(adapter.readBinary('missing.bin')).rejects.toThrow('File not found: missing.bin');
    });
  });

  describe('remove()', () => {
    it('should remove a text file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');
      await adapter.remove('file.md');

      expect(await adapter.exists('file.md')).toBe(false);
    });

    it('should remove a binary file', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('file.bin', new ArrayBuffer(0));
      await adapter.remove('file.bin');

      expect(await adapter.exists('file.bin')).toBe(false);
    });

    it('should remove file metadata', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');
      await adapter.remove('file.md');

      expect(await adapter.stat('file.md')).toBeNull();
    });
  });

  describe('rename()', () => {
    it('should rename a text file', async () => {
      const adapter = createAdapter();
      await adapter.write('old.md', 'data');
      await adapter.rename('old.md', 'new.md');

      expect(await adapter.exists('old.md')).toBe(false);
      expect(await adapter.read('new.md')).toBe('data');
    });

    it('should rename a binary file', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('old.bin', Uint8Array.of(1).buffer);
      await adapter.rename('old.bin', 'new.bin');

      expect(await adapter.exists('old.bin')).toBe(false);
      const result = new Uint8Array(await adapter.readBinary('new.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should preserve file metadata after rename', async () => {
      const adapter = createAdapter();
      await adapter.write('old.md', 'data', { ctime: TIMESTAMP_A, mtime: TIMESTAMP_B });
      await adapter.rename('old.md', 'new.md');
      const stat = await adapter.stat('new.md');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
      expect(stat?.mtime).toBe(TIMESTAMP_B);
    });

    it('should rename a directory and all its contents', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('old-dir');
      await adapter.write('old-dir/file.md', 'data');
      await adapter.rename('old-dir', 'new-dir');

      expect(await adapter.exists('old-dir')).toBe(false);
      expect(await adapter.exists('new-dir')).toBe(true);
      expect(await adapter.read('new-dir/file.md')).toBe('data');
    });

    it('should rename a directory with binary files', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('old-dir');
      await adapter.writeBinary('old-dir/data.bin', Uint8Array.of(1).buffer);
      await adapter.rename('old-dir', 'new-dir');

      expect(await adapter.exists('old-dir')).toBe(false);
      expect(await adapter.exists('new-dir')).toBe(true);
      const result = new Uint8Array(await adapter.readBinary('new-dir/data.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should throw when renaming a non-existent file', async () => {
      const adapter = createAdapter();

      await expect(adapter.rename('missing.md', 'new.md')).rejects.toThrow('File not found: missing.md');
    });

    it('should create parent directories for the new path', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');
      await adapter.rename('file.md', 'a/b/file.md');

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
    });
  });

  describe('rmdir()', () => {
    it('should remove a directory non-recursively', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');
      await adapter.rmdir('dir', false);

      expect(await adapter.exists('dir')).toBe(false);
    });

    it('should remove a directory and all contents recursively', async () => {
      const adapter = createAdapter();
      await adapter.write('dir/a.md', 'data');
      await adapter.writeBinary('dir/b.bin', new ArrayBuffer(0));
      await adapter.mkdir('dir/sub');
      await adapter.rmdir('dir', true);

      expect(await adapter.exists('dir')).toBe(false);
      expect(await adapter.exists('dir/a.md')).toBe(false);
      expect(await adapter.exists('dir/b.bin')).toBe(false);
      expect(await adapter.exists('dir/sub')).toBe(false);
    });

    it('should not remove files outside the directory on recursive delete', async () => {
      const adapter = createAdapter();
      await adapter.write('dir/file.md', 'inside');
      await adapter.write('other.md', 'outside');
      await adapter.rmdir('dir', true);

      expect(await adapter.read('other.md')).toBe('outside');
    });
  });

  describe('stat()', () => {
    it('should return file stat with correct metadata', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'hello', { ctime: TIMESTAMP_C, mtime: TIMESTAMP_D });
      const stat = await adapter.stat('file.md');

      expect(stat).toEqual(expect.objectContaining({
        ctime: TIMESTAMP_C,
        mtime: TIMESTAMP_D,
        size: 'hello'.length,
        type: 'file'
      }));
    });

    it('should return folder stat', async () => {
      const adapter = createAdapter();
      await adapter.mkdir('dir');
      const stat = await adapter.stat('dir');

      expect(stat).toEqual(expect.objectContaining({
        type: 'folder'
      }));
    });

    it('should return null for a non-existent path', async () => {
      const adapter = createAdapter();

      expect(await adapter.stat('missing')).toBeNull();
    });
  });

  describe('trashLocal()', () => {
    it('should remove the file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');
      await adapter.trashLocal('file.md');

      expect(await adapter.exists('file.md')).toBe(false);
    });
  });

  describe('trashSystem()', () => {
    it('should remove the file and return true', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'data');
      const result = await adapter.trashSystem('file.md');

      expect(result).toBe(true);
      expect(await adapter.exists('file.md')).toBe(false);
    });
  });

  describe('write()', () => {
    it('should write a text file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'content');

      expect(await adapter.read('file.md')).toBe('content');
    });

    it('should overwrite an existing file', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'old');
      await adapter.write('file.md', 'new');

      expect(await adapter.read('file.md')).toBe('new');
    });

    it('should preserve ctime on overwrite when not specified', async () => {
      const adapter = createAdapter();
      await adapter.write('file.md', 'old', { ctime: TIMESTAMP_A, mtime: TIMESTAMP_A });
      await adapter.write('file.md', 'new');
      const stat = await adapter.stat('file.md');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
    });

    it('should create parent directories', async () => {
      const adapter = createAdapter();
      await adapter.write('a/b/file.md', 'data');

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
    });
  });

  describe('writeBinary()', () => {
    it('should write a binary file', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('file.bin', Uint8Array.of(1).buffer);

      const result = new Uint8Array(await adapter.readBinary('file.bin'));
      expect(Array.from(result)).toEqual([1]);
    });

    it('should track correct size in stat', async () => {
      const adapter = createAdapter();
      const data = Uint8Array.of(1, 0, 1);
      await adapter.writeBinary('file.bin', data.buffer);
      const stat = await adapter.stat('file.bin');

      expect(stat?.size).toBe(data.length);
    });

    it('should respect ctime and mtime options', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('file.bin', Uint8Array.of(1).buffer, { ctime: TIMESTAMP_C, mtime: TIMESTAMP_D });
      const stat = await adapter.stat('file.bin');

      expect(stat?.ctime).toBe(TIMESTAMP_C);
      expect(stat?.mtime).toBe(TIMESTAMP_D);
    });

    it('should preserve ctime on overwrite when not specified', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('file.bin', Uint8Array.of(1).buffer, { ctime: TIMESTAMP_A, mtime: TIMESTAMP_A });
      await adapter.writeBinary('file.bin', Uint8Array.of(0).buffer);
      const stat = await adapter.stat('file.bin');

      expect(stat?.ctime).toBe(TIMESTAMP_A);
    });

    it('should create parent directories', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('a/b/file.bin', new ArrayBuffer(0));

      expect(await adapter.exists('a')).toBe(true);
      expect(await adapter.exists('a/b')).toBe(true);
    });
  });

  describe('list() with binary files at root', () => {
    it('should not list files from subdirectories at root level', async () => {
      const adapter = createAdapter();
      await adapter.write('root.md', 'data');
      await adapter.write('sub/nested.md', 'data');
      await adapter.writeBinary('sub/nested.bin', new ArrayBuffer(0));

      const result = await adapter.list('');
      expect(result.files).toContain('root.md');
      expect(result.files).not.toContain('sub/nested.md');
      expect(result.files).not.toContain('sub/nested.bin');
    });
  });

  describe('rmdir() with binary files', () => {
    it('should remove binary files in recursive delete', async () => {
      const adapter = createAdapter();
      await adapter.writeBinary('dir/file.bin', Uint8Array.of(1).buffer);
      await adapter.rmdir('dir', true);

      expect(await adapter.exists('dir/file.bin')).toBe(false);
    });
  });
});

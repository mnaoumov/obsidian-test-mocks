import {
  describe,
  expect,
  it
} from 'vitest';

import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';

function createAdapter(): FileSystemAdapter {
  return FileSystemAdapter.create__('/vault');
}

describe('InMemoryAdapter', () => {
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
});

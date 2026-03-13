import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureNonNullable } from '../../src/internal/type-guards.ts';
import { App } from '../../src/obsidian/App.ts';
import { TFile } from '../../src/obsidian/TFile.ts';
import { TFolder } from '../../src/obsidian/TFolder.ts';

describe('Vault', () => {
  describe('getAbstractFileByPathInsensitive__()', () => {
    it('should find a file with exact case', async () => {
      const app = await App.createConfigured__({ files: { 'Notes/File.md': 'content' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('Notes/File.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Notes/File.md');
    });

    it('should find a file with different case', async () => {
      const app = await App.createConfigured__({ files: { 'Notes/File.md': 'content' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('notes/file.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Notes/File.md');
    });

    it('should find a folder with different case', async () => {
      const app = await App.createConfigured__({ files: { 'Archive/': '' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('archive');

      expect(result).toBeInstanceOf(TFolder);
      expect(result?.path).toBe('Archive');
    });

    it('should return null for a non-existent path', async () => {
      const app = await App.createConfigured__();
      const result = app.vault.getAbstractFileByPathInsensitive__('missing');

      expect(result).toBeNull();
    });

    it('should find the root with /', async () => {
      const app = await App.createConfigured__();
      const result = app.vault.getAbstractFileByPathInsensitive__('/');

      expect(result).toBeInstanceOf(TFolder);
    });

    it('should find a file created via vault.create', async () => {
      const app = await App.createConfigured__();
      await app.vault.create('Test/Note.md', 'data');
      const result = app.vault.getAbstractFileByPathInsensitive__('test/note.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Test/Note.md');
    });

    it('should find a folder created via vault.createFolder', async () => {
      const app = await App.createConfigured__();
      await app.vault.createFolder('Archive');
      const result = app.vault.getAbstractFileByPathInsensitive__('archive');

      expect(result).toBeInstanceOf(TFolder);
      expect(result?.path).toBe('Archive');
    });

    it('should not find a deleted file', async () => {
      const app = await App.createConfigured__({ files: { 'file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('file.md'));
      await app.vault.delete(file);
      const result = app.vault.getAbstractFileByPathInsensitive__('file.md');

      expect(result).toBeNull();
    });

    it('should find a file at its new path after rename', async () => {
      const app = await App.createConfigured__({ files: { 'old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      await app.vault.rename(file, 'New.md');

      expect(app.vault.getAbstractFileByPathInsensitive__('new.md')?.path).toBe('New.md');
    });

    it('should not find a file at its old path after rename', async () => {
      const app = await App.createConfigured__({ files: { 'Old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('Old.md'));
      await app.vault.rename(file, 'New.md');

      expect(app.vault.getAbstractFileByPathInsensitive__('old.md')).toBeNull();
    });
  });
});

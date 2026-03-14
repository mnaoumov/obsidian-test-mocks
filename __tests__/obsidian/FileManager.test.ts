import type { FileManager as FileManagerOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureNonNullable } from '../../src/internal/type-guards.ts';
import { App } from '../../src/obsidian/App.ts';

describe('FileManager', () => {
  async function createApp(files?: Record<string, string>): Promise<App> {
    return files ? App.createConfigured__({ files }) : App.createConfigured__();
  }

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const app = await createApp();
      const original: FileManagerOriginal = app.fileManager.asOriginalType__();
      expect(original).toBe(app.fileManager);
    });
  });

  describe('generateMarkdownLink', () => {
    it('should generate a simple wiki link', async () => {
      const app = await createApp({ 'note.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const link = app.fileManager.generateMarkdownLink(file, '');
      expect(link).toBe('[[note]]');
    });

    it('should include subpath when provided', async () => {
      const app = await createApp({ 'note.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const link = app.fileManager.generateMarkdownLink(file, '', 'heading');
      expect(link).toBe('[[note#heading]]');
    });

    it('should include alias when provided', async () => {
      const app = await createApp({ 'note.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const link = app.fileManager.generateMarkdownLink(file, '', undefined, 'display');
      expect(link).toBe('[[note|display]]');
    });

    it('should include both subpath and alias', async () => {
      const app = await createApp({ 'note.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const link = app.fileManager.generateMarkdownLink(file, '', 'heading', 'display');
      expect(link).toBe('[[note#heading|display]]');
    });
  });

  describe('getAvailablePathForAttachment', () => {
    it('should return the filename as-is', async () => {
      const app = await createApp();
      const path = await app.fileManager.getAvailablePathForAttachment('image.png');
      expect(path).toBe('image.png');
    });
  });

  describe('getNewFileParent', () => {
    it('should return the parent folder when source path has a parent', async () => {
      const app = await createApp({ 'notes/file.md': '' });
      const folder = app.fileManager.getNewFileParent('notes/file.md');
      expect(folder.path).toBe('notes');
    });

    it('should return root when source path has no parent', async () => {
      const app = await createApp();
      const folder = app.fileManager.getNewFileParent('file.md');
      expect(folder.path).toBe('/');
    });

    it('should return root when parent folder does not exist', async () => {
      const app = await createApp();
      const folder = app.fileManager.getNewFileParent('nonexistent/file.md');
      expect(folder.path).toBe('/');
    });
  });

  describe('processFrontMatter', () => {
    it('should parse existing frontmatter and pass it to the callback', async () => {
      const app = await createApp({ 'note.md': '---\ntitle: Hello\n---\nBody' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const cb = vi.fn();
      await app.fileManager.processFrontMatter(file, cb);
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hello' }));
    });

    it('should create frontmatter when none exists', async () => {
      const app = await createApp({ 'note.md': 'Body content' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.fileManager.processFrontMatter(file, (fm) => {
        fm['tags'] = ['test'];
      });
      const content = await app.vault.read(file);
      expect(content).toContain('tags:');
    });

    it('should write modified frontmatter back to the file', async () => {
      const app = await createApp({ 'note.md': '---\ntitle: Old\n---\nBody' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.fileManager.processFrontMatter(file, (fm) => {
        fm['title'] = 'New';
      });
      const content = await app.vault.read(file);
      expect(content).toContain('title: New');
    });

    it('should preserve body content after frontmatter update', async () => {
      const app = await createApp({ 'note.md': '---\ntitle: Test\n---\nBody text' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.fileManager.processFrontMatter(file, (fm) => {
        fm['added'] = true;
      });
      const content = await app.vault.read(file);
      expect(content).toContain('Body text');
    });

    it('should handle file with no body after frontmatter', async () => {
      const app = await createApp({ 'note.md': '---\ntitle: Only\n---\n' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.fileManager.processFrontMatter(file, (fm) => {
        fm['extra'] = 'value';
      });
      const content = await app.vault.read(file);
      expect(content).toContain('extra: value');
    });

    it('should handle YAML that parses to a non-object by using empty object', async () => {
      const app = await createApp({ 'note.md': '---\njust a string\n---\nBody' });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const cb = vi.fn();
      await app.fileManager.processFrontMatter(file, cb);
      // When YAML parses to a string (not an object), an empty frontmatter should be used
      expect(cb).toHaveBeenCalledWith({});
    });
  });

  describe('promptForDeletion', () => {
    it('should trash the file', async () => {
      const app = await createApp({ 'delete-me.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('delete-me.md'));
      await app.fileManager.promptForDeletion(file);
      expect(app.vault.getFileByPath('delete-me.md')).toBeNull();
    });
  });

  describe('renameFile', () => {
    it('should rename the file', async () => {
      const app = await createApp({ 'old.md': 'content' });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      await app.fileManager.renameFile(file, 'new.md');
      expect(app.vault.getFileByPath('old.md')).toBeNull();
      expect(app.vault.getFileByPath('new.md')).not.toBeNull();
    });
  });

  describe('trashFile', () => {
    it('should trash the file', async () => {
      const app = await createApp({ 'trash-me.md': '' });
      const file = ensureNonNullable(app.vault.getFileByPath('trash-me.md'));
      await app.fileManager.trashFile(file);
      expect(app.vault.getFileByPath('trash-me.md')).toBeNull();
    });
  });
});

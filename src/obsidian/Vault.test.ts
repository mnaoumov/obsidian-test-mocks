import type { Vault as VaultOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  ensureGenericObject,
  ensureNonNullable
} from '../internal/type-guards.ts';
import { App } from './App.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';
import { Vault } from './Vault.ts';

const BINARY_SIZE_SMALL = 2;
const BINARY_SIZE_MEDIUM = 4;
const BINARY_SIZE_LARGE = 8;
const EXPECTED_FILE_COUNT = 2;

describe('Vault', () => {
  describe('asOriginalType2__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const original: VaultOriginal = app.vault.asOriginalType2__();
      expect(original).toBe(app.vault);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const mock = Vault.fromOriginalType2__(app.vault.asOriginalType2__());
      expect(mock).toBe(app.vault);
    });
  });

  describe('configDir', () => {
    it('should default to .obsidian', async () => {
      const app = await App.createConfigured__();
      expect(app.vault.configDir).toBe('.obsidian');
    });
  });

  describe('recurseChildren()', () => {
    it('should recurse into nested folders', async () => {
      const app = await App.createConfigured__({
        files: {
          'a/b/c.md': 'content',
          'a/d.md': 'content'
        }
      });
      const root = app.vault.getRoot();
      const paths: string[] = [];
      Vault.recurseChildren(root, (f) => {
        paths.push(f.path);
      });
      expect(paths).toContain('a/b/c.md');
      expect(paths).toContain('a/d.md');
    });

    it('should invoke callback for files and folders', async () => {
      const app = await App.createConfigured__({
        files: { 'folder/file.md': 'data' }
      });
      const root = app.vault.getRoot();
      const files: unknown[] = [];
      const folders: unknown[] = [];
      Vault.recurseChildren(root, (f) => {
        if (f instanceof TFile) {
          files.push(f);
        }
        if (f instanceof TFolder) {
          folders.push(f);
        }
      });
      expect(files.length).toBeGreaterThanOrEqual(1);
      expect(folders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('append()', () => {
    it('should append data to a file', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.append(file, ' world');
      const content = await app.vault.read(file);
      expect(content).toBe('hello world');
    });

    it('should trigger modify event', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.append(file, ' world');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('appendBinary()', () => {
    it('should append binary data to a file', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.createBinary('data.bin', Uint8Array.of(1, BINARY_SIZE_SMALL).buffer);
      const APPEND_MARKER = 3;
      await app.vault.appendBinary(file, Uint8Array.of(APPEND_MARKER, BINARY_SIZE_MEDIUM).buffer);
      const result = new Uint8Array(await app.vault.readBinary(file));
      expect(Array.from(result)).toEqual([1, BINARY_SIZE_SMALL, APPEND_MARKER, BINARY_SIZE_MEDIUM]);
    });

    it('should trigger modify event', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.createBinary('data.bin', new ArrayBuffer(BINARY_SIZE_SMALL));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.appendBinary(file, new ArrayBuffer(BINARY_SIZE_SMALL));
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('cachedRead()', () => {
    it('should read file content', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'cached content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const content = await app.vault.cachedRead(file);
      expect(content).toBe('cached content');
    });
  });

  describe('copy()', () => {
    it('should copy a file to a new path', async () => {
      const app = await App.createConfigured__({ files: { 'original.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('original.md'));
      const copied = await app.vault.copy(file, 'copied.md');
      expect(copied).toBeInstanceOf(TFile);
      expect(copied.path).toBe('copied.md');
      expect(app.vault.getFileByPath('copied.md')).toBe(copied);
    });

    it('should trigger create event', async () => {
      const app = await App.createConfigured__({ files: { 'original.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('original.md'));
      const handler = vi.fn();
      app.vault.on('create', handler);
      const copied = await app.vault.copy(file, 'copied.md');
      expect(handler).toHaveBeenCalledWith(copied);
    });
  });

  describe('create()', () => {
    it('should create a file and return it', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('test.md', 'content');
      expect(file).toBeInstanceOf(TFile);
      expect(file.path).toBe('test.md');
    });

    it('should trigger create event', async () => {
      const app = await App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const file = await app.vault.create('test.md', 'content');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('createBinary()', () => {
    it('should create a binary file and return it', async () => {
      const app = await App.createConfigured__();
      const data = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      const file = await app.vault.createBinary('image.png', data);
      expect(file).toBeInstanceOf(TFile);
      expect(file.path).toBe('image.png');
    });

    it('should trigger create event', async () => {
      const app = await App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const data = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      const file = await app.vault.createBinary('image.png', data);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('createFolder()', () => {
    it('should create a folder and return it', async () => {
      const app = await App.createConfigured__();
      const folder = await app.vault.createFolder('new-folder');
      expect(folder).toBeInstanceOf(TFolder);
      expect(folder.path).toBe('new-folder');
    });

    it('should trigger create event', async () => {
      const app = await App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const folder = await app.vault.createFolder('new-folder');
      expect(handler).toHaveBeenCalledWith(folder);
    });
  });

  describe('delete()', () => {
    it('should delete a file', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should delete a folder', async () => {
      const app = await App.createConfigured__({ files: { 'folder/': '' } });
      const folder = ensureNonNullable(app.vault.getFolderByPath('folder'));
      await app.vault.delete(folder);
      expect(app.vault.getFolderByPath('folder')).toBeNull();
    });

    it('should trigger delete event', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('delete', handler);
      await app.vault.delete(file);
      expect(handler).toHaveBeenCalledWith(file);
    });

    it('should remove file from parent children', async () => {
      const app = await App.createConfigured__({ files: { 'folder/note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/note.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      expect(parent.children).toContain(file);
      await app.vault.delete(file);
      expect(parent.children).not.toContain(file);
    });

    it('should handle deleting a file with no parent', async () => {
      const app = await App.createConfigured__({ files: { 'orphan.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('orphan.md'));
      file.parent = null;
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('orphan.md')).toBeNull();
    });

    it('should handle deleting a file already removed from parent children', async () => {
      const app = await App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      // Manually remove from parent.children so indexOf returns -1 in deleteVaultAbstractFile
      const idx = parent.children.indexOf(file);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
      }
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('folder/file.md')).toBeNull();
      expect(parent.children).not.toContain(file);
    });
  });

  describe('getAbstractFileByPath()', () => {
    it('should return the file at the given path', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = app.vault.getAbstractFileByPath('note.md');
      expect(file).toBeInstanceOf(TFile);
    });

    it('should return null for nonexistent path', async () => {
      const app = await App.createConfigured__();
      expect(app.vault.getAbstractFileByPath('missing.md')).toBeNull();
    });
  });

  describe('getAllFolders()', () => {
    it('should return all folders', async () => {
      const app = await App.createConfigured__({ files: { 'a/b.md': 'content' } });
      const folders = app.vault.getAllFolders();
      expect(folders.length).toBeGreaterThanOrEqual(1);
      for (const f of folders) {
        expect(f).toBeInstanceOf(TFolder);
      }
    });
  });

  describe('getAllLoadedFiles()', () => {
    it('should return all files and folders', async () => {
      const app = await App.createConfigured__({ files: { 'a.md': 'data' } });
      const all = app.vault.getAllLoadedFiles();
      expect(all.length).toBeGreaterThanOrEqual(EXPECTED_FILE_COUNT);
    });
  });

  describe('getFileByPath()', () => {
    it('should return TFile for a file path', async () => {
      const app = await App.createConfigured__({ files: { 'test.md': 'content' } });
      const file = app.vault.getFileByPath('test.md');
      expect(file).toBeInstanceOf(TFile);
    });

    it('should return null for a folder path', async () => {
      const app = await App.createConfigured__({ files: { 'folder/': '' } });
      expect(app.vault.getFileByPath('folder')).toBeNull();
    });

    it('should return null for nonexistent path', async () => {
      const app = await App.createConfigured__();
      expect(app.vault.getFileByPath('nope.md')).toBeNull();
    });
  });

  describe('getFiles()', () => {
    it('should return only TFile instances', async () => {
      const app = await App.createConfigured__({ files: { 'a.md': '', 'b.txt': '' } });
      const files = app.vault.getFiles();
      for (const f of files) {
        expect(f).toBeInstanceOf(TFile);
      }
      expect(files.length).toBe(EXPECTED_FILE_COUNT);
    });
  });

  describe('getFolderByPath()', () => {
    it('should return TFolder for a folder path', async () => {
      const app = await App.createConfigured__({ files: { 'folder/': '' } });
      const folder = app.vault.getFolderByPath('folder');
      expect(folder).toBeInstanceOf(TFolder);
    });

    it('should return null for a file path', async () => {
      const app = await App.createConfigured__({ files: { 'file.md': 'data' } });
      expect(app.vault.getFolderByPath('file.md')).toBeNull();
    });

    it('should return null for nonexistent path', async () => {
      const app = await App.createConfigured__();
      expect(app.vault.getFolderByPath('nope')).toBeNull();
    });
  });

  describe('getMarkdownFiles()', () => {
    it('should return only markdown files', async () => {
      const app = await App.createConfigured__({ files: { 'a.md': '', 'b.txt': '', 'c.md': '' } });
      const mdFiles = app.vault.getMarkdownFiles();
      expect(mdFiles.length).toBe(EXPECTED_FILE_COUNT);
      for (const f of mdFiles) {
        expect(f.extension).toBe('md');
      }
    });
  });

  describe('getName()', () => {
    it('should return an empty string', async () => {
      const app = await App.createConfigured__();
      expect(app.vault.getName()).toBe('');
    });
  });

  describe('getResourcePath()', () => {
    it('should return an empty string', async () => {
      const app = await App.createConfigured__({ files: { 'file.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('file.md'));
      expect(app.vault.getResourcePath(file)).toBe('');
    });
  });

  describe('getRoot()', () => {
    it('should return the root folder', async () => {
      const app = await App.createConfigured__();
      const root = app.vault.getRoot();
      expect(root).toBeInstanceOf(TFolder);
      expect(root.path).toBe('/');
    });

    it('should create a fallback root when fileMap has no root entry', async () => {
      const app = await App.createConfigured__();
      // Remove the root entry to trigger the fallback branch
      const fileMap = ensureGenericObject(app.vault).fileMap as Record<string, unknown>;
      delete fileMap['/'];
      const root = app.vault.getRoot();
      expect(root).toBeInstanceOf(TFolder);
      expect(root.path).toBe('/');
      // It should also store the fallback in fileMap
      expect(fileMap['/']).toBe(root);
    });
  });

  describe('modify()', () => {
    it('should modify file content', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'old' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.modify(file, 'new');
      const content = await app.vault.read(file);
      expect(content).toBe('new');
    });

    it('should trigger modify event', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'old' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.modify(file, 'new');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('modifyBinary()', () => {
    it('should modify binary file content', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.createBinary('bin.dat', new ArrayBuffer(BINARY_SIZE_SMALL));
      const newData = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      await app.vault.modifyBinary(file, newData);
      const result = await app.vault.readBinary(file);
      expect(result.byteLength).toBe(BINARY_SIZE_MEDIUM);
    });

    it('should trigger modify event', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.createBinary('bin.dat', new ArrayBuffer(BINARY_SIZE_SMALL));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.modifyBinary(file, new ArrayBuffer(BINARY_SIZE_MEDIUM));
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('process()', () => {
    it('should read, transform, and write content', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const result = await app.vault.process(file, (data) => data.toUpperCase());
      expect(result).toBe('HELLO');
      const content = await app.vault.read(file);
      expect(content).toBe('HELLO');
    });

    it('should trigger modify event', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.process(file, (d) => d);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('read()', () => {
    it('should read file content', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'read me' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const content = await app.vault.read(file);
      expect(content).toBe('read me');
    });
  });

  describe('readBinary()', () => {
    it('should read binary file content', async () => {
      const app = await App.createConfigured__();
      const data = new ArrayBuffer(BINARY_SIZE_LARGE);
      const file = await app.vault.createBinary('bin.dat', data);
      const result = await app.vault.readBinary(file);
      expect(result.byteLength).toBe(BINARY_SIZE_LARGE);
    });
  });

  describe('rename()', () => {
    it('should rename a file and update its properties', async () => {
      const app = await App.createConfigured__({ files: { 'old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      await app.vault.rename(file, 'new.md');
      expect(file.path).toBe('new.md');
      expect(file.name).toBe('new.md');
      expect(file.basename).toBe('new');
      expect(file.extension).toBe('md');
      expect(app.vault.getFileByPath('old.md')).toBeNull();
      expect(app.vault.getFileByPath('new.md')).toBe(file);
    });

    it('should trigger rename event with old path', async () => {
      const app = await App.createConfigured__({ files: { 'old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      const handler = vi.fn();
      app.vault.on('rename', handler);
      await app.vault.rename(file, 'new.md');
      expect(handler).toHaveBeenCalledWith(file, 'old.md');
    });

    it('should handle renaming a file without an extension', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('readme', 'data');
      await app.vault.rename(file, 'license');
      expect(file.basename).toBe('license');
      expect(file.extension).toBe('');
    });

    it('should remove file from old parent and add to new parent', async () => {
      const app = await App.createConfigured__({ files: { 'a/file.md': 'content', 'b/': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/file.md'));
      const oldParent = ensureNonNullable(app.vault.getFolderByPath('a'));
      const newParent = ensureNonNullable(app.vault.getFolderByPath('b'));
      expect(oldParent.children).toContain(file);

      await app.vault.rename(file, 'b/file.md');

      expect(oldParent.children).not.toContain(file);
      expect(newParent.children).toContain(file);
    });

    it('should handle renaming a file with no parent', async () => {
      const app = await App.createConfigured__({ files: { 'root-file.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('root-file.md'));
      // Detach from parent to test null parent path
      file.parent = null;
      await app.vault.rename(file, 'renamed-root.md');
      expect(file.path).toBe('renamed-root.md');
      expect(file.name).toBe('renamed-root.md');
    });

    it('should handle rename when file is already removed from parent children', async () => {
      const app = await App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      // Manually remove from parent.children so indexOf returns -1
      const idx = parent.children.indexOf(file);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
      }
      await app.vault.rename(file, 'folder/renamed.md');
      expect(file.path).toBe('folder/renamed.md');
    });

    it('should rename a TFolder and move its nested contents', async () => {
      const app = await App.createConfigured__({
        files: {
          'old-dir/sub/deep.md': 'deep-content'
        }
      });
      const folder = ensureNonNullable(app.vault.getFolderByPath('old-dir'));
      await app.vault.rename(folder, 'new-dir');
      expect(app.vault.getFolderByPath('old-dir')).toBeNull();
      expect(app.vault.getFolderByPath('new-dir')).not.toBeNull();
    });
  });

  describe('create() at root', () => {
    it('should set parent to root folder for files at root level', async () => {
      const app = await App.createConfigured__();
      const file = await app.vault.create('root-file.md', 'content');
      expect(file.parent).toBe(app.vault.getRoot());
    });
  });

  describe('trash()', () => {
    it('should trash a file', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.trash(file, false);
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should trash a folder', async () => {
      const app = await App.createConfigured__({ files: { 'folder/': '' } });
      const folder = ensureNonNullable(app.vault.getFolderByPath('folder'));
      await app.vault.trash(folder, false);
      expect(app.vault.getFolderByPath('folder')).toBeNull();
    });

    it('should trigger delete event', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('delete', handler);
      await app.vault.trash(file, false);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('setVaultAbstractFile__()', () => {
    it('should add a file to the vault and set deleted__ to false', async () => {
      const app = await App.createConfigured__();
      const file = TFile.create__(app.vault, 'manual.md');
      app.vault.setVaultAbstractFile__('manual.md', file);
      expect(app.vault.getFileByPath('manual.md')).toBe(file);
      expect(file.deleted__).toBe(false);
    });

    it('should link the file to its parent folder', async () => {
      const app = await App.createConfigured__();
      await app.vault.createFolder('parent');
      const file = TFile.create__(app.vault, 'parent/child.md');
      app.vault.setVaultAbstractFile__('parent/child.md', file);
      const parent = ensureNonNullable(app.vault.getFolderByPath('parent'));
      expect(parent.children).toContain(file);
      expect(file.parent).toBe(parent);
    });

    it('should be findable via case-insensitive lookup', async () => {
      const app = await App.createConfigured__();
      const file = TFile.create__(app.vault, 'CamelCase.md');
      app.vault.setVaultAbstractFile__('CamelCase.md', file);
      expect(app.vault.getAbstractFileByPathInsensitive__('camelcase.md')).toBe(file);
    });

    it('should not duplicate children when called twice for the same file', async () => {
      const app = await App.createConfigured__();
      const file = TFile.create__(app.vault, 'dup.md');
      app.vault.setVaultAbstractFile__('dup.md', file);
      app.vault.setVaultAbstractFile__('dup.md', file);
      const root = app.vault.getRoot();
      const count = root.children.filter((c) => c === file).length;
      expect(count).toBe(1);
    });
  });

  describe('deleteVaultAbstractFile__()', () => {
    it('should remove a file from the vault by path', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      app.vault.deleteVaultAbstractFile__('note.md');
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should set deleted__ to true on the removed file', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      app.vault.deleteVaultAbstractFile__('note.md');
      expect(file.deleted__).toBe(true);
    });

    it('should remove the file from its parent children', async () => {
      const app = await App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      expect(parent.children).toContain(file);
      app.vault.deleteVaultAbstractFile__('folder/file.md');
      expect(parent.children).not.toContain(file);
    });

    it('should remove the file from case-insensitive lookup', async () => {
      const app = await App.createConfigured__({ files: { 'Note.md': 'content' } });
      app.vault.deleteVaultAbstractFile__('Note.md');
      expect(app.vault.getAbstractFileByPathInsensitive__('note.md')).toBeNull();
    });

    it('should be a no-op for a non-existent path', async () => {
      const app = await App.createConfigured__();
      expect(() => {
        app.vault.deleteVaultAbstractFile__('missing.md');
      }).not.toThrow();
    });
  });

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

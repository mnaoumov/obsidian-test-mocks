import type {
  DataAdapter as DataAdapterOriginal,
  FileStats as FileStatsOriginal,
  Vault as VaultOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';
import { Vault } from './Vault.ts';

const BINARY_SIZE_SMALL = 2;
const BINARY_SIZE_MEDIUM = 4;
const BINARY_SIZE_LARGE = 8;
const EXPECTED_FILE_COUNT = 2;
const STAT_CTIME = 100;
const STAT_MTIME = 200;
const STAT_MTIME_LATER = 300;
const CONTENT = 'hello';
const LONGER_CONTENT = 'hello, world';

describe('Vault', () => {
  describe('asOriginalType2__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const original: VaultOriginal = app.vault.asOriginalType2__();
      expect(original).toBe(app.vault);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const mock = Vault.fromOriginalType2__(app.vault.asOriginalType2__());
      expect(mock).toBe(app.vault);
    });
  });

  describe('configDir', () => {
    it('should default to .obsidian', () => {
      const app = App.createConfigured__();
      expect(app.vault.configDir).toBe('.obsidian');
    });
  });

  describe('recurseChildren()', () => {
    it('should recurse into nested folders', () => {
      const app = App.createConfigured__({
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

    it('should invoke callback for files and folders', () => {
      const app = App.createConfigured__({
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
      const app = App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.append(file, ' world');
      const content = await app.vault.read(file);
      expect(content).toBe('hello world');
    });

    it('should trigger modify event', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.append(file, ' world');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('appendBinary()', () => {
    it('should append binary data to a file', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.createBinary('data.bin', Uint8Array.of(1, BINARY_SIZE_SMALL).buffer);
      const APPEND_MARKER = 3;
      await app.vault.appendBinary(file, Uint8Array.of(APPEND_MARKER, BINARY_SIZE_MEDIUM).buffer);
      const result = new Uint8Array(await app.vault.readBinary(file));
      expect([...result]).toEqual([1, BINARY_SIZE_SMALL, APPEND_MARKER, BINARY_SIZE_MEDIUM]);
    });

    it('should trigger modify event', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.createBinary('data.bin', new ArrayBuffer(BINARY_SIZE_SMALL));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.appendBinary(file, new ArrayBuffer(BINARY_SIZE_SMALL));
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('cachedRead()', () => {
    it('should read file content', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'cached content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const content = await app.vault.cachedRead(file);
      expect(content).toBe('cached content');
    });
  });

  describe('copy()', () => {
    it('should copy a file to a new path', async () => {
      const app = App.createConfigured__({ files: { 'original.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('original.md'));
      const copied = await app.vault.copy(file, 'copied.md');
      expect(copied).toBeInstanceOf(TFile);
      expect(copied.path).toBe('copied.md');
      expect(app.vault.getFileByPath('copied.md')).toBe(copied);
    });

    it('should trigger create event', async () => {
      const app = App.createConfigured__({ files: { 'original.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('original.md'));
      const handler = vi.fn();
      app.vault.on('create', handler);
      const copied = await app.vault.copy(file, 'copied.md');
      expect(handler).toHaveBeenCalledWith(copied);
    });
  });

  describe('create()', () => {
    it('should create a file and return it', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('test.md', 'content');
      expect(file).toBeInstanceOf(TFile);
      expect(file.path).toBe('test.md');
    });

    it('should trigger create event', async () => {
      const app = App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const file = await app.vault.create('test.md', 'content');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('createBinary()', () => {
    it('should create a binary file and return it', async () => {
      const app = App.createConfigured__();
      const data = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      const file = await app.vault.createBinary('image.png', data);
      expect(file).toBeInstanceOf(TFile);
      expect(file.path).toBe('image.png');
    });

    it('should trigger create event', async () => {
      const app = App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const data = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      const file = await app.vault.createBinary('image.png', data);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('createFolder()', () => {
    it('should create a folder and return it', async () => {
      const app = App.createConfigured__();
      const folder = await app.vault.createFolder('new-folder');
      expect(folder).toBeInstanceOf(TFolder);
      expect(folder.path).toBe('new-folder');
    });

    it('should trigger create event', async () => {
      const app = App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      const folder = await app.vault.createFolder('new-folder');
      expect(handler).toHaveBeenCalledWith(folder);
    });

    it('should create and link intermediate ancestors', async () => {
      const app = App.createConfigured__();
      const leaf = await app.vault.createFolder('a/b/c');

      const a = app.vault.getFolderByPath('a');
      const b = app.vault.getFolderByPath('a/b');
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(leaf.path).toBe('a/b/c');
      expect(leaf.parent).toBe(b);
      expect(b?.parent).toBe(a);
      expect(a?.parent).toBe(app.vault.getRoot());
    });

    it('should reuse an existing ancestor instead of duplicating it', async () => {
      const app = App.createConfigured__();
      const a = await app.vault.createFolder('a');
      const leaf = await app.vault.createFolder('a/b');
      expect(leaf.parent).toBe(a);
      expect(app.vault.getFolderByPath('a')).toBe(a);
    });
  });

  describe('delete()', () => {
    it('should delete a file', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should delete a folder', async () => {
      const app = App.createConfigured__({ files: { 'folder/': '' } });
      const folder = ensureNonNullable(app.vault.getFolderByPath('folder'));
      await app.vault.delete(folder);
      expect(app.vault.getFolderByPath('folder')).toBeNull();
    });

    it('should trigger delete event', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('delete', handler);
      await app.vault.delete(file);
      expect(handler).toHaveBeenCalledWith(file);
    });

    it('should remove file from parent children', async () => {
      const app = App.createConfigured__({ files: { 'folder/note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/note.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      expect(parent.children).toContain(file);
      await app.vault.delete(file);
      expect(parent.children).not.toContain(file);
    });

    it('should handle deleting a file with no parent', async () => {
      const app = App.createConfigured__({ files: { 'orphan.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('orphan.md'));
      file.parent = null;
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('orphan.md')).toBeNull();
    });

    it('should handle deleting a file already removed from parent children', async () => {
      const app = App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      // Manually remove from parent.children so indexOf returns -1 in deleteVaultAbstractFile
      const index = parent.children.indexOf(file);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
      await app.vault.delete(file);
      expect(app.vault.getFileByPath('folder/file.md')).toBeNull();
      expect(parent.children).not.toContain(file);
    });
  });

  describe('getAbstractFileByPath()', () => {
    it('should return the file at the given path', () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = app.vault.getAbstractFileByPath('note.md');
      expect(file).toBeInstanceOf(TFile);
    });

    it('should return null for nonexistent path', () => {
      const app = App.createConfigured__();
      expect(app.vault.getAbstractFileByPath('missing.md')).toBeNull();
    });
  });

  describe('getAllFolders()', () => {
    it('should return all folders', () => {
      const app = App.createConfigured__({ files: { 'a/b.md': 'content' } });
      const folders = app.vault.getAllFolders();
      expect(folders.length).toBeGreaterThanOrEqual(1);
      for (const f of folders) {
        expect(f).toBeInstanceOf(TFolder);
      }
    });
  });

  describe('getAllLoadedFiles()', () => {
    it('should return all files and folders', () => {
      const app = App.createConfigured__({ files: { 'a.md': 'data' } });
      const all = app.vault.getAllLoadedFiles();
      expect(all.length).toBeGreaterThanOrEqual(EXPECTED_FILE_COUNT);
    });
  });

  describe('getFileByPath()', () => {
    it('should return TFile for a file path', () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const file = app.vault.getFileByPath('test.md');
      expect(file).toBeInstanceOf(TFile);
    });

    it('should return null for a folder path', () => {
      const app = App.createConfigured__({ files: { 'folder/': '' } });
      expect(app.vault.getFileByPath('folder')).toBeNull();
    });

    it('should return null for nonexistent path', () => {
      const app = App.createConfigured__();
      expect(app.vault.getFileByPath('nope.md')).toBeNull();
    });
  });

  describe('getFiles()', () => {
    it('should return only TFile instances', () => {
      const app = App.createConfigured__({ files: { 'a.md': '', 'b.txt': '' } });
      const files = app.vault.getFiles();
      for (const f of files) {
        expect(f).toBeInstanceOf(TFile);
      }
      expect(files.length).toBe(EXPECTED_FILE_COUNT);
    });
  });

  describe('getFolderByPath()', () => {
    it('should return TFolder for a folder path', () => {
      const app = App.createConfigured__({ files: { 'folder/': '' } });
      const folder = app.vault.getFolderByPath('folder');
      expect(folder).toBeInstanceOf(TFolder);
    });

    it('should return null for a file path', () => {
      const app = App.createConfigured__({ files: { 'file.md': 'data' } });
      expect(app.vault.getFolderByPath('file.md')).toBeNull();
    });

    it('should return null for nonexistent path', () => {
      const app = App.createConfigured__();
      expect(app.vault.getFolderByPath('nope')).toBeNull();
    });
  });

  describe('getMarkdownFiles()', () => {
    it('should return only markdown files', () => {
      const app = App.createConfigured__({ files: { 'a.md': '', 'b.txt': '', 'c.md': '' } });
      const mdFiles = app.vault.getMarkdownFiles();
      expect(mdFiles.length).toBe(EXPECTED_FILE_COUNT);
      for (const f of mdFiles) {
        expect(f.extension).toBe('md');
      }
    });
  });

  describe('getName()', () => {
    it('should return an empty string', () => {
      const app = App.createConfigured__();
      expect(app.vault.getName()).toBe('');
    });
  });

  describe('getResourcePath()', () => {
    it('should return an empty string', () => {
      const app = App.createConfigured__({ files: { 'file.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('file.md'));
      expect(app.vault.getResourcePath(file)).toBe('');
    });
  });

  describe('getRoot()', () => {
    it('should return the root folder', () => {
      const app = App.createConfigured__();
      const root = app.vault.getRoot();
      expect(root).toBeInstanceOf(TFolder);
      expect(root.path).toBe('/');
    });

    it('should create a fallback root when fileMap has no root entry', () => {
      const app = App.createConfigured__();
      // Remove the root entry to trigger the fallback branch
      const fileMap = app.vault.fileMap__;
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
      const app = App.createConfigured__({ files: { 'note.md': 'old' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.modify(file, 'new');
      const content = await app.vault.read(file);
      expect(content).toBe('new');
    });

    it('should trigger modify event', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'old' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.modify(file, 'new');
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('modifyBinary()', () => {
    it('should modify binary file content', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.createBinary('bin.dat', new ArrayBuffer(BINARY_SIZE_SMALL));
      const newData = new ArrayBuffer(BINARY_SIZE_MEDIUM);
      await app.vault.modifyBinary(file, newData);
      const result = await app.vault.readBinary(file);
      expect(result.byteLength).toBe(BINARY_SIZE_MEDIUM);
    });

    it('should trigger modify event', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.createBinary('bin.dat', new ArrayBuffer(BINARY_SIZE_SMALL));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.modifyBinary(file, new ArrayBuffer(BINARY_SIZE_MEDIUM));
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('process()', () => {
    it('should read, transform, and write content', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'hello' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const result = await app.vault.process(file, (data) => data.toUpperCase());
      expect(result).toBe('HELLO');
      const content = await app.vault.read(file);
      expect(content).toBe('HELLO');
    });

    it('should trigger modify event', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('modify', handler);
      await app.vault.process(file, (d) => d);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('read()', () => {
    it('should read file content', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'read me' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const content = await app.vault.read(file);
      expect(content).toBe('read me');
    });
  });

  describe('readBinary()', () => {
    it('should read binary file content', async () => {
      const app = App.createConfigured__();
      const data = new ArrayBuffer(BINARY_SIZE_LARGE);
      const file = await app.vault.createBinary('bin.dat', data);
      const result = await app.vault.readBinary(file);
      expect(result.byteLength).toBe(BINARY_SIZE_LARGE);
    });
  });

  describe('rename()', () => {
    it('should rename a file and update its properties', async () => {
      const app = App.createConfigured__({ files: { 'old.md': 'content' } });
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
      const app = App.createConfigured__({ files: { 'old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      const handler = vi.fn();
      app.vault.on('rename', handler);
      await app.vault.rename(file, 'new.md');
      expect(handler).toHaveBeenCalledWith(file, 'old.md');
    });

    it('should handle renaming a file without an extension', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('readme', 'data');
      await app.vault.rename(file, 'license');
      expect(file.basename).toBe('license');
      expect(file.extension).toBe('');
    });

    it('should remove file from old parent and add to new parent', async () => {
      const app = App.createConfigured__({ files: { 'a/file.md': 'content', 'b/': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/file.md'));
      const oldParent = ensureNonNullable(app.vault.getFolderByPath('a'));
      const newParent = ensureNonNullable(app.vault.getFolderByPath('b'));
      expect(oldParent.children).toContain(file);

      await app.vault.rename(file, 'b/file.md');

      expect(oldParent.children).not.toContain(file);
      expect(newParent.children).toContain(file);
    });

    it('should handle renaming a file with no parent', async () => {
      const app = App.createConfigured__({ files: { 'root-file.md': 'data' } });
      const file = ensureNonNullable(app.vault.getFileByPath('root-file.md'));
      // Detach from parent to test null parent path
      file.parent = null;
      await app.vault.rename(file, 'renamed-root.md');
      expect(file.path).toBe('renamed-root.md');
      expect(file.name).toBe('renamed-root.md');
    });

    it('should handle rename when file is already removed from parent children', async () => {
      const app = App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      // Manually remove from parent.children so indexOf returns -1
      const index = parent.children.indexOf(file);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
      await app.vault.rename(file, 'folder/renamed.md');
      expect(file.path).toBe('folder/renamed.md');
    });

    it('should rename a TFolder and move its nested contents', async () => {
      const app = App.createConfigured__({
        files: {
          'old-dir/sub/deep.md': 'deep-content'
        }
      });
      const folder = ensureNonNullable(app.vault.getFolderByPath('old-dir'));
      await app.vault.rename(folder, 'new-dir');
      expect(app.vault.getFolderByPath('old-dir')).toBeNull();
      expect(app.vault.getFolderByPath('new-dir')).not.toBeNull();
    });

    it('should cascade descendant paths when a folder is renamed', async () => {
      const app = App.createConfigured__({
        files: {
          'old-dir/child.md': 'child-content',
          'old-dir/sub/deep.md': 'deep-content'
        }
      });
      const folder = ensureNonNullable(app.vault.getFolderByPath('old-dir'));
      const child = ensureNonNullable(app.vault.getFileByPath('old-dir/child.md'));
      const sub = ensureNonNullable(app.vault.getFolderByPath('old-dir/sub'));
      const deep = ensureNonNullable(app.vault.getFileByPath('old-dir/sub/deep.md'));

      await app.vault.rename(folder, 'new-dir');

      // Same objects, updated paths, reachable at the new location.
      expect(app.vault.getFileByPath('new-dir/child.md')).toBe(child);
      expect(child.path).toBe('new-dir/child.md');
      expect(app.vault.getFolderByPath('new-dir/sub')).toBe(sub);
      expect(app.vault.getFileByPath('new-dir/sub/deep.md')).toBe(deep);
      expect(deep.path).toBe('new-dir/sub/deep.md');

      // Old descendant paths are gone.
      expect(app.vault.getFileByPath('old-dir/child.md')).toBeNull();
      expect(app.vault.getFileByPath('old-dir/sub/deep.md')).toBeNull();

      // Tree links are preserved.
      expect(deep.parent).toBe(sub);
      expect(sub.parent).toBe(folder);
    });
  });

  describe('create() at root', () => {
    it('should set parent to root folder for files at root level', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('root-file.md', 'content');
      expect(file.parent).toBe(app.vault.getRoot());
    });
  });

  describe('trash()', () => {
    it('should trash a file', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.trash(file, false);
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should trash a folder', async () => {
      const app = App.createConfigured__({ files: { 'folder/': '' } });
      const folder = ensureNonNullable(app.vault.getFolderByPath('folder'));
      await app.vault.trash(folder, false);
      expect(app.vault.getFolderByPath('folder')).toBeNull();
    });

    it('should trigger delete event', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const handler = vi.fn();
      app.vault.on('delete', handler);
      await app.vault.trash(file, false);
      expect(handler).toHaveBeenCalledWith(file);
    });
  });

  describe('setVaultAbstractFile__()', () => {
    it('should add a file to the vault and set deleted__ to false', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'manual.md');
      app.vault.setVaultAbstractFile__('manual.md', file);
      expect(app.vault.getFileByPath('manual.md')).toBe(file);
      expect(file.deleted__).toBe(false);
    });

    it('should link the file to its parent folder', async () => {
      const app = App.createConfigured__();
      await app.vault.createFolder('parent');
      const file = TFile.create__(app.vault, 'parent/child.md');
      app.vault.setVaultAbstractFile__('parent/child.md', file);
      const parent = ensureNonNullable(app.vault.getFolderByPath('parent'));
      expect(parent.children).toContain(file);
      expect(file.parent).toBe(parent);
    });

    it('should be findable via case-insensitive lookup', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'CamelCase.md');
      app.vault.setVaultAbstractFile__('CamelCase.md', file);
      expect(app.vault.getAbstractFileByPathInsensitive__('camelcase.md')).toBe(file);
    });

    it('should not duplicate children when called twice for the same file', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'dup.md');
      app.vault.setVaultAbstractFile__('dup.md', file);
      app.vault.setVaultAbstractFile__('dup.md', file);
      const root = app.vault.getRoot();
      const count = root.children.filter((c) => c === file).length;
      expect(count).toBe(1);
    });
  });

  describe('deleteVaultAbstractFile__()', () => {
    it('should remove a file from the vault by path', () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      app.vault.deleteVaultAbstractFile__('note.md');
      expect(app.vault.getFileByPath('note.md')).toBeNull();
    });

    it('should set deleted__ to true on the removed file', () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      app.vault.deleteVaultAbstractFile__('note.md');
      expect(file.deleted__).toBe(true);
    });

    it('should remove the file from its parent children', () => {
      const app = App.createConfigured__({ files: { 'folder/file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('folder/file.md'));
      const parent = ensureNonNullable(app.vault.getFolderByPath('folder'));
      expect(parent.children).toContain(file);
      app.vault.deleteVaultAbstractFile__('folder/file.md');
      expect(parent.children).not.toContain(file);
    });

    it('should remove the file from case-insensitive lookup', () => {
      const app = App.createConfigured__({ files: { 'Note.md': 'content' } });
      app.vault.deleteVaultAbstractFile__('Note.md');
      expect(app.vault.getAbstractFileByPathInsensitive__('note.md')).toBeNull();
    });

    it('should be a no-op for a non-existent path', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.vault.deleteVaultAbstractFile__('missing.md');
      }).not.toThrow();
    });
  });

  describe('getAbstractFileByPathInsensitive__()', () => {
    it('should find a file with exact case', () => {
      const app = App.createConfigured__({ files: { 'Notes/File.md': 'content' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('Notes/File.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Notes/File.md');
    });

    it('should find a file with different case', () => {
      const app = App.createConfigured__({ files: { 'Notes/File.md': 'content' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('notes/file.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Notes/File.md');
    });

    it('should find a folder with different case', () => {
      const app = App.createConfigured__({ files: { 'Archive/': '' } });
      const result = app.vault.getAbstractFileByPathInsensitive__('archive');

      expect(result).toBeInstanceOf(TFolder);
      expect(result?.path).toBe('Archive');
    });

    it('should return null for a non-existent path', () => {
      const app = App.createConfigured__();
      const result = app.vault.getAbstractFileByPathInsensitive__('missing');

      expect(result).toBeNull();
    });

    it('should find the root with /', () => {
      const app = App.createConfigured__();
      const result = app.vault.getAbstractFileByPathInsensitive__('/');

      expect(result).toBeInstanceOf(TFolder);
    });

    it('should find a file created via vault.create', async () => {
      const app = App.createConfigured__();
      await app.vault.create('Test/Note.md', 'data');
      const result = app.vault.getAbstractFileByPathInsensitive__('test/note.md');

      expect(result).toBeInstanceOf(TFile);
      expect(result?.path).toBe('Test/Note.md');
    });

    it('should find a folder created via vault.createFolder', async () => {
      const app = App.createConfigured__();
      await app.vault.createFolder('Archive');
      const result = app.vault.getAbstractFileByPathInsensitive__('archive');

      expect(result).toBeInstanceOf(TFolder);
      expect(result?.path).toBe('Archive');
    });

    it('should not find a deleted file', async () => {
      const app = App.createConfigured__({ files: { 'file.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('file.md'));
      await app.vault.delete(file);
      const result = app.vault.getAbstractFileByPathInsensitive__('file.md');

      expect(result).toBeNull();
    });

    it('should find a file at its new path after rename', async () => {
      const app = App.createConfigured__({ files: { 'old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('old.md'));
      await app.vault.rename(file, 'New.md');

      expect(app.vault.getAbstractFileByPathInsensitive__('new.md')?.path).toBe('New.md');
    });

    it('should not find a file at its old path after rename', async () => {
      const app = App.createConfigured__({ files: { 'Old.md': 'content' } });
      const file = ensureNonNullable(app.vault.getFileByPath('Old.md'));
      await app.vault.rename(file, 'New.md');

      expect(app.vault.getAbstractFileByPathInsensitive__('old.md')).toBeNull();
    });
  });

  describe('createFolderSync__', () => {
    it('should create a folder synchronously', () => {
      const app = App.createConfigured__();
      const folder = app.vault.createFolderSync__('sync-folder');
      expect(folder).toBeInstanceOf(TFolder);
      expect(app.vault.getAbstractFileByPath('sync-folder')).toBe(folder);
    });

    it('should throw for non-InMemoryAdapter', () => {
      const fakeAdapter = strictProxy<DataAdapterOriginal>({});
      const vault = Vault.create2__(fakeAdapter);
      expect(() => vault.createFolderSync__('folder')).toThrow('createFolderSync__ is only supported for in-memory adapters');
    });
  });

  describe('createSync__', () => {
    it('should create a file synchronously', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('sync-file.md', 'content');
      expect(file).toBeInstanceOf(TFile);
      expect(app.vault.getFileByPath('sync-file.md')).toBe(file);
    });

    it('should throw for non-InMemoryAdapter', () => {
      const fakeAdapter = strictProxy<DataAdapterOriginal>({});
      const vault = Vault.create2__(fakeAdapter);
      expect(() => vault.createSync__('file.md', 'content')).toThrow('createSync__ is only supported for in-memory adapters');
    });
  });

  describe('readSync__', () => {
    it('should read a file synchronously', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('sync-read.md', 'hello');
      expect(app.vault.readSync__(file)).toBe('hello');
    });

    it('should throw for non-InMemoryAdapter', () => {
      const fakeAdapter = strictProxy<DataAdapterOriginal>({});
      const vault = Vault.create2__(fakeAdapter);
      const file = TFile.create__(vault, 'file.md');
      expect(() => vault.readSync__(file)).toThrow('readSync__ is only supported for in-memory adapters');
    });
  });

  describe('reconcile__', () => {
    it('should add a file created directly through the adapter', async () => {
      const app = App.createConfigured__();
      const handler = vi.fn();
      app.vault.on('create', handler);
      await app.vault.adapter.write('added.md', '# Added');

      // Stale before reconcile.
      expect(app.vault.getFileByPath('added.md')).toBeNull();

      app.vault.reconcile__();
      const file = app.vault.getFileByPath('added.md');
      expect(file).not.toBeNull();
      expect(handler).toHaveBeenCalledWith(file);
    });

    it('should add a folder created directly through the adapter', async () => {
      const app = App.createConfigured__();
      await app.vault.adapter.mkdir('fresh');

      app.vault.reconcile__();
      expect(app.vault.getFolderByPath('fresh')).not.toBeNull();
    });

    it('should remove a file deleted directly through the adapter', async () => {
      const app = App.createConfigured__({ files: { 'gone.md': 'x' } });
      const file = ensureNonNullable(app.vault.getFileByPath('gone.md'));
      const handler = vi.fn();
      app.vault.on('delete', handler);
      await app.vault.adapter.remove('gone.md');

      app.vault.reconcile__();
      expect(app.vault.getFileByPath('gone.md')).toBeNull();
      expect(handler).toHaveBeenCalledWith(file);
    });

    it('should reflect an adapter directory rename', async () => {
      const app = App.createConfigured__({ files: { 'old/child.md': 'x' } });
      await app.vault.adapter.rename('old', 'new');

      app.vault.reconcile__();
      expect(app.vault.getFolderByPath('old')).toBeNull();
      expect(app.vault.getFolderByPath('new')).not.toBeNull();
      expect(app.vault.getFileByPath('new/child.md')).not.toBeNull();
    });

    it('should be a no-op when the tree already matches the adapter', () => {
      const app = App.createConfigured__({ files: { 'a/b.md': 'x' } });
      const file = ensureNonNullable(app.vault.getFileByPath('a/b.md'));
      const folder = ensureNonNullable(app.vault.getFolderByPath('a'));

      app.vault.reconcile__();
      // Existing entries are reused, not recreated.
      expect(app.vault.getFileByPath('a/b.md')).toBe(file);
      expect(app.vault.getFolderByPath('a')).toBe(folder);
    });

    it('should register nested folders shallowest-first', async () => {
      const app = App.createConfigured__();
      await app.vault.adapter.write('x/y/z.md', 'x');

      app.vault.reconcile__();
      expect(app.vault.getFolderByPath('x')).not.toBeNull();
      expect(app.vault.getFolderByPath('x/y')).not.toBeNull();
      expect(app.vault.getFileByPath('x/y/z.md')).not.toBeNull();
    });

    it('should ignore dot-prefixed adapter paths', async () => {
      const app = App.createConfigured__();
      await app.vault.adapter.write('.hidden/secret.md', 'x');

      app.vault.reconcile__();
      expect(app.vault.getFileByPath('.hidden/secret.md')).toBeNull();
      expect(app.vault.getFolderByPath('.hidden')).toBeNull();
    });

    it('should not remove dot-prefixed tree entries', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('.keep.md', 'x');

      app.vault.reconcile__();
      expect(app.vault.getFileByPath('.keep.md')).toBe(file);
    });

    it('should throw for non-InMemoryAdapter', () => {
      const fakeAdapter = strictProxy<DataAdapterOriginal>({});
      const vault = Vault.create2__(fakeAdapter);
      expect(() => {
        vault.reconcile__();
      }).toThrow('reconcile__ is only supported for in-memory adapters');
    });
  });

  describe('refreshStat__()', () => {
    it('should populate stat on create()', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME, size: CONTENT.length });
    });

    it('should populate stat on createBinary()', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.createBinary('data.bin', new ArrayBuffer(BINARY_SIZE_MEDIUM), { ctime: STAT_CTIME, mtime: STAT_MTIME });

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME, size: BINARY_SIZE_MEDIUM });
    });

    it('should populate stat on createSync__()', () => {
      const app = App.createConfigured__();
      const file = app.vault.createSync__('note.md', CONTENT);

      expect(file.stat.size).toBe(CONTENT.length);
      expect(file.stat.ctime).toBeGreaterThan(0);
      expect(file.stat.mtime).toBeGreaterThan(0);
    });

    it('should populate stat before the create event fires', async () => {
      const app = App.createConfigured__();
      const observed: FileStatsOriginal[] = [];
      app.vault.on('create', (...data: unknown[]) => {
        observed.push({ ...(data[0] as TFile).stat });
      });
      await app.vault.create('note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });

      expect(observed).toEqual([{ ctime: STAT_CTIME, mtime: STAT_MTIME, size: CONTENT.length }]);
    });

    it('should populate stat on copy()', async () => {
      const app = App.createConfigured__({ files: { 'note.md': CONTENT } });
      const source = ensureNonNullable(app.vault.getFileByPath('note.md'));
      const copied = await app.vault.copy(source, 'copy.md');

      expect(copied.stat.size).toBe(CONTENT.length);
      expect(copied.stat.ctime).toBeGreaterThan(0);
      expect(copied.stat.mtime).toBeGreaterThan(0);
    });

    it('should update mtime and size on modify() while preserving ctime', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });
      await app.vault.modify(file, LONGER_CONTENT, { mtime: STAT_MTIME_LATER });

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME_LATER, size: LONGER_CONTENT.length });
    });

    it('should update stat on append()', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });
      await app.vault.append(file, CONTENT, { mtime: STAT_MTIME_LATER });

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME_LATER, size: (CONTENT + CONTENT).length });
    });

    it('should keep stat across rename()', async () => {
      const app = App.createConfigured__();
      const file = await app.vault.create('note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });
      await app.vault.rename(file, 'renamed.md');

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME, size: CONTENT.length });
    });

    it('should keep a descendant stat across a folder rename', async () => {
      const app = App.createConfigured__({ files: { 'folder/': '' } });
      const file = await app.vault.create('folder/note.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });
      const folder = ensureNonNullable(app.vault.getFolderByPath('folder'));
      await app.vault.rename(folder, 'renamed');

      expect(file.path).toBe('renamed/note.md');
      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME, size: CONTENT.length });
    });

    it('should populate stat for a file discovered by reconcile__()', async () => {
      const app = App.createConfigured__();
      await app.vault.adapter.write('added.md', CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME });
      app.vault.reconcile__();
      const file = ensureNonNullable(app.vault.getFileByPath('added.md'));

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME, size: CONTENT.length });
    });

    it('should refresh stat of an already tracked file on reconcile__()', async () => {
      const app = App.createConfigured__({ files: { 'note.md': CONTENT } });
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));
      await app.vault.adapter.write('note.md', LONGER_CONTENT, { ctime: STAT_CTIME, mtime: STAT_MTIME_LATER });
      app.vault.reconcile__();

      expect(file.stat).toEqual({ ctime: STAT_CTIME, mtime: STAT_MTIME_LATER, size: LONGER_CONTENT.length });
    });

    it('should leave stat untouched for a path the adapter does not know', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'ghost.md');
      app.vault.refreshStat__(file);

      expect(file.stat).toEqual({ ctime: 0, mtime: 0, size: 0 });
    });

    it('should do nothing for a non-InMemoryAdapter', () => {
      const fakeAdapter = strictProxy<DataAdapterOriginal>({});
      const vault = Vault.create2__(fakeAdapter);
      const file = TFile.create__(vault, 'note.md');
      vault.refreshStat__(file);

      expect(file.stat).toEqual({ ctime: 0, mtime: 0, size: 0 });
    });
  });

  describe('getConfig__() / setConfig__()', () => {
    it('should default attachmentFolderPath to the vault root', () => {
      const app = App.createConfigured__();
      expect(app.vault.getConfig__('attachmentFolderPath')).toBe('/');
    });

    it('should return undefined for a key that was never set', () => {
      const app = App.createConfigured__();
      expect(app.vault.getConfig__('newLinkFormat')).toBeUndefined();
    });

    it('should round-trip a value written by setConfig__', () => {
      const app = App.createConfigured__();
      app.vault.setConfig__('attachmentFolderPath', './assets');
      expect(app.vault.getConfig__('attachmentFolderPath')).toBe('./assets');
    });

    it('should not share config between vaults', () => {
      const app1 = App.createConfigured__();
      const app2 = App.createConfigured__();
      app1.vault.setConfig__('attachmentFolderPath', 'Files');
      expect(app2.vault.getConfig__('attachmentFolderPath')).toBe('/');
    });
  });

  describe('getAvailablePath__()', () => {
    it('should return the plain path when it is free', () => {
      const app = App.createConfigured__();
      expect(app.vault.getAvailablePath__('note', 'md')).toBe('note.md');
    });

    it('should omit the dot when the extension is empty', () => {
      const app = App.createConfigured__();
      expect(app.vault.getAvailablePath__('note', '')).toBe('note');
    });

    it('should append " 1" when the plain path is taken', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', 'content');
      expect(app.vault.getAvailablePath__('note', 'md')).toBe('note 1.md');
    });

    it('should increment until a free path is found', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', 'content');
      app.vault.createSync__('note 1.md', 'content');
      expect(app.vault.getAvailablePath__('note', 'md')).toBe('note 2.md');
    });

    it('should de-duplicate when the extension is empty', () => {
      const app = App.createConfigured__();
      app.vault.createSync__('note', 'content');
      expect(app.vault.getAvailablePath__('note', '')).toBe('note 1');
    });
  });

  describe('getAvailablePathForAttachments__()', () => {
    function createFixture(attachmentFolderPath: string): App {
      const app = App.createConfigured__();
      app.vault.createFolderSync__('Docs/api');
      app.vault.createSync__('Docs/api/get.md', 'content');
      app.vault.createSync__('RootNote.md', 'content');
      app.vault.setConfig__('attachmentFolderPath', attachmentFolderPath);
      return app;
    }

    function nestedNote(app: App): TFile {
      return ensureNonNullable(app.vault.getFileByPath('Docs/api/get.md'));
    }

    function rootNote(app: App): TFile {
      return ensureNonNullable(app.vault.getFileByPath('RootNote.md'));
    }

    it('should put the attachment in the vault root for "/"', async () => {
      const app = createFixture('/');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('img.png');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('img.png');
    });

    it('should put the attachment next to the note for "./"', async () => {
      const app = createFixture('./');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('Docs/api/img.png');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('img.png');
    });

    it('should put the attachment in a sub-folder of the note folder for "./assets"', async () => {
      const app = createFixture('./assets');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('Docs/api/assets/img.png');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('assets/img.png');
    });

    it('should put the attachment in the fixed folder for "Files"', async () => {
      const app = createFixture('Files');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('Files/img.png');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('Files/img.png');
    });

    it('should create the target folder when it is missing', async () => {
      const app = createFixture('./assets');
      expect(app.vault.getFolderByPath('Docs/api/assets')).toBeNull();
      await app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app));
      expect(app.vault.getFolderByPath('Docs/api/assets')).not.toBeNull();
    });

    it('should reuse an existing folder found case-insensitively', async () => {
      const app = createFixture('files');
      app.vault.createFolderSync__('Files');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('Files/img.png');
    });

    it('should treat a null file as a root-level note', async () => {
      const app = createFixture('./');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', null)).resolves.toBe('img.png');
    });

    it('should treat a null file as a root-level note for a relative folder', async () => {
      const app = createFixture('./assets');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', null)).resolves.toBe('assets/img.png');
    });

    it('should de-duplicate against an existing attachment', async () => {
      const app = createFixture('/');
      app.vault.createSync__('img.png', 'content');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('img 1.png');
    });

    it('should treat "." like "./"', async () => {
      const app = createFixture('.');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('Docs/api/img.png');
    });

    it('should fall back to the vault root when the setting is unset', async () => {
      const app = createFixture('/');
      app.vault.setConfig__('attachmentFolderPath', undefined);
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', nestedNote(app))).resolves.toBe('img.png');
    });

    it('should ignore trailing slashes in a fixed folder', async () => {
      const app = createFixture('Files/');
      await expect(app.vault.getAvailablePathForAttachments__('img', 'png', rootNote(app))).resolves.toBe('Files/img.png');
    });
  });
});

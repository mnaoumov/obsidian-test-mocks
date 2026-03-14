import type { TFolder as TFolderOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { TFile } from '../../src/obsidian/TFile.ts';
import { TFolder } from '../../src/obsidian/TFolder.ts';

describe('TAbstractFile (via TFile)', () => {
  it('should extract name from path', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'folder/note.md');
    expect(file.name).toBe('note.md');
  });

  it('should set the full path', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'folder/note.md');
    expect(file.path).toBe('folder/note.md');
  });

  it('should set the vault reference', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.vault).toBe(app.vault);
  });

  it('should have deleted__ default to false', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.deleted__).toBe(false);
  });

  it('should have parent default to null', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.parent).toBeNull();
  });

  it('should handle empty path by extracting empty name', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, '');
    expect(file.name).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', async () => {
      const app = await App.createConfigured__();
      const file = TFile.create__(app.vault, 'note.md');
      expect(file.asOriginalType__()).toBe(file);
    });
  });
});

describe('TFile', () => {
  it('should extract basename and extension', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'docs/readme.md');
    expect(file.basename).toBe('readme');
    expect(file.extension).toBe('md');
  });

  it('should handle files without extension', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'Makefile');
    expect(file.basename).toBe('Makefile');
    expect(file.extension).toBe('');
  });

  it('should have default stat', async () => {
    const app = await App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.stat.ctime).toBe(0);
    expect(file.stat.mtime).toBe(0);
    expect(file.stat.size).toBe(0);
  });
});

describe('TFolder', () => {
  it('should create a folder', async () => {
    const app = await App.createConfigured__();
    const folder = TFolder.create__(app.vault, 'my-folder');
    expect(folder).toBeInstanceOf(TFolder);
    expect(folder.name).toBe('my-folder');
  });

  it('should have empty children array', async () => {
    const app = await App.createConfigured__();
    const folder = TFolder.create__(app.vault, 'folder');
    expect(folder.children).toEqual([]);
  });

  describe('isRoot', () => {
    it('should return true for empty path', async () => {
      const app = await App.createConfigured__();
      const folder = TFolder.create__(app.vault, '');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return true for slash path', async () => {
      const app = await App.createConfigured__();
      const folder = TFolder.create__(app.vault, '/');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return false for non-root path', async () => {
      const app = await App.createConfigured__();
      const folder = TFolder.create__(app.vault, 'subfolder');
      expect(folder.isRoot()).toBe(false);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const folder = TFolder.create__(app.vault, 'my-folder');
      const original: TFolderOriginal = folder.asOriginalType__();
      expect(original).toBe(folder);
    });
  });
});

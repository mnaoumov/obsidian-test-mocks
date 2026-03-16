import type { TAbstractFile as TAbstractFileOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { TAbstractFile } from './TAbstractFile.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';

describe('TAbstractFile (via TFile)', () => {
  it('should extract name from path', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'folder/note.md');
    expect(file.name).toBe('note.md');
  });

  it('should set the full path', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'folder/note.md');
    expect(file.path).toBe('folder/note.md');
  });

  it('should set the vault reference', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.vault).toBe(app.vault);
  });

  it('should have deleted__ default to false', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.deleted__).toBe(false);
  });

  it('should have parent default to null', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.parent).toBeNull();
  });

  it('should handle empty path by extracting empty name', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, '');
    expect(file.name).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'note.md');
      expect(file.asOriginalType__()).toBe(file);
    });

    it('should work via TAbstractFile.prototype', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'note.md');
      const original: TAbstractFileOriginal = TAbstractFile.prototype.asOriginalType__.call(file);
      expect(original).toBe(file);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'note.md');
      const mock = TAbstractFile.fromOriginalType__(file.asOriginalType__());
      expect(mock).toBe(file);
    });
  });

  describe('constructor__', () => {
    it('should be callable without throwing', () => {
      const app = App.createConfigured__();
      const file = TFile.create__(app.vault, 'note.md');
      expect(() => {
        file.constructor__(app.vault, 'note.md');
      }).not.toThrow();
    });
  });
});

describe('TFile', () => {
  it('should extract basename and extension', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'docs/readme.md');
    expect(file.basename).toBe('readme');
    expect(file.extension).toBe('md');
  });

  it('should handle files without extension', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'Makefile');
    expect(file.basename).toBe('Makefile');
    expect(file.extension).toBe('');
  });

  it('should have default stat', () => {
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'note.md');
    expect(file.stat.ctime).toBe(0);
    expect(file.stat.mtime).toBe(0);
    expect(file.stat.size).toBe(0);
  });
});

describe('TFolder', () => {
  it('should create a folder', () => {
    const app = App.createConfigured__();
    const folder = TFolder.create__(app.vault, 'my-folder');
    expect(folder).toBeInstanceOf(TFolder);
    expect(folder.name).toBe('my-folder');
  });

  it('should have empty children array', () => {
    const app = App.createConfigured__();
    const folder = TFolder.create__(app.vault, 'folder');
    expect(folder.children).toEqual([]);
  });

  describe('isRoot', () => {
    it('should return true for empty path', () => {
      const app = App.createConfigured__();
      const folder = TFolder.create__(app.vault, '');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return true for slash path', () => {
      const app = App.createConfigured__();
      const folder = TFolder.create__(app.vault, '/');
      expect(folder.isRoot()).toBe(true);
    });

    it('should return false for non-root path', () => {
      const app = App.createConfigured__();
      const folder = TFolder.create__(app.vault, 'subfolder');
      expect(folder.isRoot()).toBe(false);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const folder = TFolder.create__(app.vault, 'my-folder');
      const original: TAbstractFileOriginal = folder.asOriginalType__();
      expect(original).toBe(folder);
    });
  });
});

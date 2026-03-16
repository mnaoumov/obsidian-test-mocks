import type { FileView as FileViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import {
  ensureGenericObject,
  ensureNonNullable
} from '../internal/type-guards.ts';
import { App } from './App.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteFileView extends FileView {
  public override getViewType(): string {
    return 'test-file-view';
  }
}

describe('FileView', () => {
  function createFileView(): ConcreteFileView {
    const app = App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new ConcreteFileView(leaf);
  }

  it('should create an instance', () => {
    const view = createFileView();
    expect(view).toBeInstanceOf(FileView);
  });

  it('should throw when accessing an unmocked property', () => {
    const view = createFileView();
    const record = ensureGenericObject(view);
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const view = createFileView();
      const original: FileViewOriginal = view.asOriginalType4__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const view = createFileView();
      const mock = FileView.fromOriginalType4__(view.asOriginalType4__());
      expect(mock).toBe(view);
    });
  });

  describe('allowNoFile', () => {
    it('should default to false', () => {
      const view = createFileView();
      expect(view.allowNoFile).toBe(false);
    });
  });

  describe('file', () => {
    it('should default to null', () => {
      const view = createFileView();
      expect(view.file).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should default to true', () => {
      const view = createFileView();
      expect(view.navigation).toBe(true);
    });
  });

  describe('getDisplayText', () => {
    it('should return empty string when no file', () => {
      const view = createFileView();
      expect(view.getDisplayText()).toBe('');
    });

    it('should return basename when file is set', () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      view.file = file;
      expect(view.getDisplayText()).toBe('test');
    });
  });

  describe('canAcceptExtension', () => {
    it('should return false', () => {
      const view = createFileView();
      expect(view.canAcceptExtension('md')).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return a state object', () => {
      const view = createFileView();
      const state = view.getState();
      expect(state).toBeDefined();
    });
  });

  describe('setState', () => {
    it('should set state via parent', async () => {
      const view = createFileView();
      await view.setState({ key: 'value' }, { history: false });
      // State was set on parent (View), which FileView spreads
      expect(view.getState()).toBeDefined();
    });
  });

  describe('onload', () => {
    it('should be callable without error', () => {
      const view = createFileView();
      expect(() => {
        view.onload();
      }).not.toThrow();
    });
  });

  describe('onLoadFile', () => {
    it('should resolve without error', async () => {
      const app = App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onLoadFile(file)).resolves.toBeUndefined();
    });
  });

  describe('onRename', () => {
    it('should resolve without error', async () => {
      const app = App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onRename(file)).resolves.toBeUndefined();
    });
  });

  describe('onUnloadFile', () => {
    it('should resolve without error', async () => {
      const app = App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onUnloadFile(file)).resolves.toBeUndefined();
    });
  });
});

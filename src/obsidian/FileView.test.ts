import type { FileView as FileViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { FileView } from './FileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteFileView extends FileView {
  public override getViewType(): string {
    return 'test-file-view';
  }
}

describe('FileView', () => {
  async function createFileView(): Promise<ConcreteFileView> {
    const app = await App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new ConcreteFileView(leaf);
  }

  it('should create an instance', async () => {
    const view = await createFileView();
    expect(view).toBeInstanceOf(FileView);
  });

  it('should throw when accessing an unmocked property', async () => {
    const view = await createFileView();
    const record = view as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const view = await createFileView();
      const original: FileViewOriginal = view.asOriginalType4__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createFileView();
      const mock = FileView.fromOriginalType4__(view.asOriginalType4__());
      expect(mock).toBe(view);
    });
  });

  describe('allowNoFile', () => {
    it('should default to false', async () => {
      const view = await createFileView();
      expect(view.allowNoFile).toBe(false);
    });
  });

  describe('file', () => {
    it('should default to null', async () => {
      const view = await createFileView();
      expect(view.file).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should default to true', async () => {
      const view = await createFileView();
      expect(view.navigation).toBe(true);
    });
  });

  describe('getDisplayText', () => {
    it('should return empty string when no file', async () => {
      const view = await createFileView();
      expect(view.getDisplayText()).toBe('');
    });

    it('should return basename when file is set', async () => {
      const app = await App.createConfigured__({ files: { 'test.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      view.file = file;
      expect(view.getDisplayText()).toBe('test');
    });
  });

  describe('canAcceptExtension', () => {
    it('should return false', async () => {
      const view = await createFileView();
      expect(view.canAcceptExtension('md')).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return a state object', async () => {
      const view = await createFileView();
      const state = view.getState();
      expect(state).toBeDefined();
    });
  });

  describe('setState', () => {
    it('should set state via parent', async () => {
      const view = await createFileView();
      await view.setState({ key: 'value' }, { history: false });
      // State was set on parent (View), which FileView spreads
      expect(view.getState()).toBeDefined();
    });
  });

  describe('onload', () => {
    it('should be callable without error', async () => {
      const view = await createFileView();
      expect(() => {
        view.onload();
      }).not.toThrow();
    });
  });

  describe('onLoadFile', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onLoadFile(file)).resolves.toBeUndefined();
    });
  });

  describe('onRename', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onRename(file)).resolves.toBeUndefined();
    });
  });

  describe('onUnloadFile', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__({ files: { 'test.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteFileView(leaf);
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await expect(view.onUnloadFile(file)).resolves.toBeUndefined();
    });
  });
});

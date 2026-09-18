import type { FileView as FileViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import type { ViewStateResultInternal } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
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
    it('should default to true, opting back into the history the base view opts out of', () => {
      const view = createFileView();
      expect(view.navigation).toBe(true);
    });
  });

  describe('getDisplayText', () => {
    it('should return Obsidian\'s No file label when no file', () => {
      const view = createFileView();
      expect(view.getDisplayText()).toBe('No file');
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

    it('should carry the loaded file\'s path, as Obsidian\'s does', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));
      expect(view.getState()).toEqual({ file: 'test.md' });
    });
  });

  describe('loadFile', () => {
    it('should load the file and answer that it changed', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));

      await expect(view.loadFile(file)).resolves.toBe(true);

      expect(view.file).toBe(file);
    });

    it('should answer false for the file it already holds', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      const file = ensureNonNullable(app.vault.getFileByPath('test.md'));
      await view.loadFile(file);

      await expect(view.loadFile(file)).resolves.toBe(false);
    });

    it('should unload the previous file first', async () => {
      const app = App.createConfigured__({ files: { 'first.md': '', 'second.md': '' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      const first = ensureNonNullable(app.vault.getFileByPath('first.md'));
      await view.loadFile(first);
      const unloadSpy = vi.spyOn(view, 'onUnloadFile');

      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('second.md')));

      expect(unloadSpy).toHaveBeenCalledExactlyOnceWith(first);
    });

    it('should log a load hook that throws and leave the view with no file', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      vi.spyOn(view, 'onLoadFile').mockRejectedValue(new Error('Load failed'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);

      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));

      expect(view.file).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
      errorSpy.mockRestore();
    });

    it('should ask for the active-leaf events when its leaf is the active one', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      const view = new ConcreteFileView(leaf);
      const eventsSpy = vi.spyOn(app.workspace, 'requestActiveLeafEvents');

      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));

      expect(eventsSpy).toHaveBeenCalled();
    });
  });

  describe('setState', () => {
    it('should set state via parent', async () => {
      const view = createFileView();
      await view.setState({ key: 'value' }, { history: false });
      // State was set on parent (View), which FileView spreads
      expect(view.getState()).toBeDefined();
    });

    it('should load the file the state names, and record it in the result', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      const result: ViewStateResultInternal = { history: false };

      await view.setState({ file: 'test.md' }, result);

      expect(view.file).toBe(ensureNonNullable(app.vault.getFileByPath('test.md')));
      expect(result).toEqual({ history: true, layout: true });
    });

    it('should unload the file when the state names a path that is no file', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));

      await view.setState({ file: 'missing.md' }, { history: false });

      expect(view.file).toBeNull();
    });

    it('should unload the file when the state\'s file entry is not a path', async () => {
      const app = App.createConfigured__({ files: { 'test.md': 'content' } });
      const view = new ConcreteFileView(WorkspaceLeaf.create2__(app));
      await view.loadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));

      await view.setState({ file: null }, { history: false });

      expect(view.file).toBeNull();
    });

    it('should ask the leaf to close a view left with no file', async () => {
      const view = createFileView();
      const result: ViewStateResultInternal = { history: false };

      await view.setState({}, result);

      expect(result.close).toBe(true);
    });

    it('should stay open with no file when allowNoFile is set', async () => {
      const view = createFileView();
      view.allowNoFile = true;
      const result: ViewStateResultInternal = { history: false };

      await view.setState({}, result);

      expect(result.close).toBeUndefined();
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

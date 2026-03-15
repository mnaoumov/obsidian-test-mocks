import type { TextFileView as TextFileViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { TextFileView } from './TextFileView.ts';
import { TFile } from './TFile.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteTextFileView extends TextFileView {
  public clear(): void {
    this.data = '';
  }

  public getViewData(): string {
    return this.data;
  }

  public getViewType(): string {
    return 'test-text-view';
  }

  public setViewData(data: string, _clear: boolean): void {
    this.data = data;
  }
}

describe('TextFileView', () => {
  it('should create an instance via subclass', async () => {
    const app = await App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    const view = new ConcreteTextFileView(leaf);
    expect(view).toBeInstanceOf(TextFileView);
  });

  it('should have data default to empty string', async () => {
    const app = await App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    const view = new ConcreteTextFileView(leaf);
    expect(view.data).toBe('');
  });

  describe('onLoadFile', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      const file = TFile.create__(app.vault, 'test.md');
      await expect(view.onLoadFile(file)).resolves.toBeUndefined();
    });
  });

  describe('onUnloadFile', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      const file = TFile.create__(app.vault, 'test.md');
      await expect(view.onUnloadFile(file)).resolves.toBeUndefined();
    });
  });

  describe('requestSave', () => {
    it('should not throw', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      expect(() => {
        view.requestSave();
      }).not.toThrow();
    });
  });

  describe('save', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      await expect(view.save()).resolves.toBeUndefined();
    });
  });

  describe('asOriginalType6__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      const original: TextFileViewOriginal = view.asOriginalType6__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType6__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new ConcreteTextFileView(leaf);
      const mock = TextFileView.fromOriginalType6__(view.asOriginalType6__());
      expect(mock).toBe(view);
    });
  });
});

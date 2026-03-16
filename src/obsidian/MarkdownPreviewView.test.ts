import type { MarkdownPreviewView as MarkdownPreviewViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { MarkdownPreviewView } from './MarkdownPreviewView.ts';
import { MarkdownView } from './MarkdownView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

async function createPreviewView(): Promise<MarkdownPreviewView> {
  const app = await App.createConfigured__({
    files: {
      'test.md': 'test content'
    }
  });
  const leaf = WorkspaceLeaf.create2__(app);
  const mdView = MarkdownView.create2__(leaf);
  await mdView.onLoadFile(ensureNonNullable(app.vault.getFileByPath('test.md')));
  return MarkdownPreviewView.create3__(mdView);
}

describe('MarkdownPreviewView', () => {
  it('should create an instance via create3__', async () => {
    const view = await createPreviewView();
    expect(view).toBeInstanceOf(MarkdownPreviewView);
  });

  describe('get / set', () => {
    it('should set and get data', async () => {
      const view = await createPreviewView();
      view.set('preview content', false);
      expect(view.get()).toBe('preview content');
    });
  });

  describe('clear', () => {
    it('should clear data', async () => {
      const view = await createPreviewView();
      view.set('content', false);
      view.clear();
      expect(view.get()).toBe('');
    });
  });

  describe('getScroll', () => {
    it('should return 0', async () => {
      const view = await createPreviewView();
      expect(view.getScroll()).toBe(0);
    });
  });

  describe('applyScroll', () => {
    it('should not throw', async () => {
      const view = await createPreviewView();
      const SCROLL_POS = 100;
      expect(() => {
        view.applyScroll(SCROLL_POS);
      }).not.toThrow();
    });
  });

  describe('rerender', () => {
    it('should not throw', async () => {
      const view = await createPreviewView();
      expect(() => {
        view.rerender();
      }).not.toThrow();
    });

    it('should accept full parameter', async () => {
      const view = await createPreviewView();
      expect(() => {
        view.rerender(true);
      }).not.toThrow();
    });
  });

  describe('file', () => {
    it('should throw when no file is set on the markdown view', async () => {
      const view = await createPreviewView();
      expect(() => view.file).toThrow('Value is null');
    });
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createPreviewView();
      const original: MarkdownPreviewViewOriginal = view.asOriginalType4__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createPreviewView();
      const mock = MarkdownPreviewView.fromOriginalType4__(view.asOriginalType4__());
      expect(mock).toBe(view);
    });
  });
});

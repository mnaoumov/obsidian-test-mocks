import type { MarkdownPreviewView as MarkdownPreviewViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { MarkdownPreviewView } from '../../src/obsidian/MarkdownPreviewView.ts';
import { MarkdownView } from '../../src/obsidian/MarkdownView.ts';
import { WorkspaceLeaf } from '../../src/obsidian/WorkspaceLeaf.ts';

async function createPreviewView(): Promise<MarkdownPreviewView> {
  const app = await App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  const mdView = MarkdownView.create2__(leaf);
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
    it('should return a value from the getter', async () => {
      const view = await createPreviewView();
      // The getter returns castTo<TFile>(null), so it returns null typed as TFile
      expect(view.file).toBeDefined();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createPreviewView();
      const original: MarkdownPreviewViewOriginal = view.asOriginalType__();
      expect(original).toBe(view);
    });
  });
});

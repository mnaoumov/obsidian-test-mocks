import type { MarkdownView as MarkdownViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { MarkdownView } from './MarkdownView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

async function createMarkdownView(): Promise<MarkdownView> {
  const app = await App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  return MarkdownView.create2__(leaf);
}

describe('MarkdownView', () => {
  it('should create an instance via create2__', async () => {
    const view = await createMarkdownView();
    expect(view).toBeInstanceOf(MarkdownView);
  });

  it('should have an editor', async () => {
    const view = await createMarkdownView();
    expect(view.editor).toBeDefined();
  });

  describe('getViewType', () => {
    it('should return markdown', async () => {
      const view = await createMarkdownView();
      expect(view.getViewType()).toBe('markdown');
    });
  });

  describe('getMode', () => {
    it('should return source by default', async () => {
      const view = await createMarkdownView();
      expect(view.getMode()).toBe('source');
    });
  });

  describe('canAcceptExtension', () => {
    it('should accept md extension', async () => {
      const view = await createMarkdownView();
      expect(view.canAcceptExtension('md')).toBe(true);
    });

    it('should reject other extensions', async () => {
      const view = await createMarkdownView();
      expect(view.canAcceptExtension('txt')).toBe(false);
    });
  });

  describe('getViewData / setViewData', () => {
    it('should set and get view data', async () => {
      const view = await createMarkdownView();
      view.setViewData('test content', false);
      expect(view.getViewData()).toBe('test content');
    });

    it('should also update the editor', async () => {
      const view = await createMarkdownView();
      view.setViewData('editor sync', false);
      expect(view.editor.getValue()).toBe('editor sync');
    });
  });

  describe('clear', () => {
    it('should clear data and editor', async () => {
      const view = await createMarkdownView();
      view.setViewData('content', false);
      view.clear();
      expect(view.getViewData()).toBe('');
      expect(view.editor.getValue()).toBe('');
    });
  });

  describe('showSearch', () => {
    it('should not throw', async () => {
      const view = await createMarkdownView();
      expect(() => {
        view.showSearch();
      }).not.toThrow();
    });
  });

  describe('currentMode', () => {
    it('should get and set data via currentMode', async () => {
      const view = await createMarkdownView();
      view.currentMode.set('via current mode', false);
      expect(view.currentMode.get()).toBe('via current mode');
    });

    it('should track scroll', async () => {
      const view = await createMarkdownView();
      const SCROLL_POS = 42;
      view.currentMode.applyScroll(SCROLL_POS);
      expect(view.currentMode.getScroll()).toBe(SCROLL_POS);
    });

    it('should clear via currentMode', async () => {
      const view = await createMarkdownView();
      view.setViewData('data', false);
      view.currentMode.clear();
      expect(view.editor.getValue()).toBe('');
    });

    it('should not throw on rerender', async () => {
      const view = await createMarkdownView();
      expect(() => {
        view.currentMode.rerender();
      }).not.toThrow();
    });
  });

  describe('previewMode', () => {
    it('should get and set data via previewMode', async () => {
      const view = await createMarkdownView();
      view.previewMode.set('preview data', false);
      expect(view.previewMode.get()).toBe('preview data');
    });

    it('should track scroll', async () => {
      const view = await createMarkdownView();
      const SCROLL_POS = 99;
      view.previewMode.applyScroll(SCROLL_POS);
      expect(view.previewMode.getScroll()).toBe(SCROLL_POS);
    });

    it('should clear preview data', async () => {
      const view = await createMarkdownView();
      view.previewMode.set('content', false);
      view.previewMode.clear();
      expect(view.previewMode.get()).toBe('');
    });

    it('should not throw on rerender', async () => {
      const view = await createMarkdownView();
      expect(() => {
        view.previewMode.rerender();
      }).not.toThrow();
    });
  });

  describe('asOriginalType7__', () => {
    it('should return the same instance typed as the original', async () => {
      const view = await createMarkdownView();
      const original: MarkdownViewOriginal = view.asOriginalType7__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType7__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const view = await createMarkdownView();
      const mock = MarkdownView.fromOriginalType7__(view.asOriginalType7__());
      expect(mock).toBe(view);
    });
  });
});

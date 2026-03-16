import type { MarkdownView as MarkdownViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { MarkdownView } from './MarkdownView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

function createMarkdownView(): MarkdownView {
  const app = App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  return MarkdownView.create2__(leaf);
}

describe('MarkdownView', () => {
  it('should create an instance via create2__', () => {
    const view = createMarkdownView();
    expect(view).toBeInstanceOf(MarkdownView);
  });

  it('should have an editor', () => {
    const view = createMarkdownView();
    expect(view.editor).toBeDefined();
  });

  describe('getViewType', () => {
    it('should return markdown', () => {
      const view = createMarkdownView();
      expect(view.getViewType()).toBe('markdown');
    });
  });

  describe('getMode', () => {
    it('should return source by default', () => {
      const view = createMarkdownView();
      expect(view.getMode()).toBe('source');
    });
  });

  describe('canAcceptExtension', () => {
    it('should accept md extension', () => {
      const view = createMarkdownView();
      expect(view.canAcceptExtension('md')).toBe(true);
    });

    it('should reject other extensions', () => {
      const view = createMarkdownView();
      expect(view.canAcceptExtension('txt')).toBe(false);
    });
  });

  describe('getViewData / setViewData', () => {
    it('should set and get view data', () => {
      const view = createMarkdownView();
      view.setViewData('test content', false);
      expect(view.getViewData()).toBe('test content');
    });

    it('should also update the editor', () => {
      const view = createMarkdownView();
      view.setViewData('editor sync', false);
      expect(view.editor.getValue()).toBe('editor sync');
    });
  });

  describe('clear', () => {
    it('should clear data and editor', () => {
      const view = createMarkdownView();
      view.setViewData('content', false);
      view.clear();
      expect(view.getViewData()).toBe('');
      expect(view.editor.getValue()).toBe('');
    });
  });

  describe('showSearch', () => {
    it('should not throw', () => {
      const view = createMarkdownView();
      expect(() => {
        view.showSearch();
      }).not.toThrow();
    });
  });

  describe('currentMode', () => {
    it('should get and set data via currentMode', () => {
      const view = createMarkdownView();
      view.currentMode.set('via current mode', false);
      expect(view.currentMode.get()).toBe('via current mode');
    });

    it('should track scroll', () => {
      const view = createMarkdownView();
      const SCROLL_POS = 42;
      view.currentMode.applyScroll(SCROLL_POS);
      expect(view.currentMode.getScroll()).toBe(SCROLL_POS);
    });

    it('should clear via currentMode', () => {
      const view = createMarkdownView();
      view.setViewData('data', false);
      view.currentMode.clear();
      expect(view.editor.getValue()).toBe('');
    });

    it('should not throw on rerender', () => {
      const view = createMarkdownView();
      expect(() => {
        view.currentMode.rerender();
      }).not.toThrow();
    });
  });

  describe('previewMode', () => {
    it('should get and set data via previewMode', () => {
      const view = createMarkdownView();
      view.previewMode.set('preview data', false);
      expect(view.previewMode.get()).toBe('preview data');
    });

    it('should track scroll', () => {
      const view = createMarkdownView();
      const SCROLL_POS = 99;
      view.previewMode.applyScroll(SCROLL_POS);
      expect(view.previewMode.getScroll()).toBe(SCROLL_POS);
    });

    it('should clear preview data', () => {
      const view = createMarkdownView();
      view.previewMode.set('content', false);
      view.previewMode.clear();
      expect(view.previewMode.get()).toBe('');
    });

    it('should not throw on rerender', () => {
      const view = createMarkdownView();
      expect(() => {
        view.previewMode.rerender();
      }).not.toThrow();
    });
  });

  describe('asOriginalType7__', () => {
    it('should return the same instance typed as the original', () => {
      const view = createMarkdownView();
      const original: MarkdownViewOriginal = view.asOriginalType7__();
      expect(original).toBe(view);
    });
  });

  describe('fromOriginalType7__', () => {
    it('should return the same instance typed as the mock type', () => {
      const view = createMarkdownView();
      const mock = MarkdownView.fromOriginalType7__(view.asOriginalType7__());
      expect(mock).toBe(view);
    });
  });
});

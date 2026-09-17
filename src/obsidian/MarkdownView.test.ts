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

    it('should report the current mode type', () => {
      const view = createMarkdownView();
      view.currentMode = view.previewMode;
      expect(view.getMode()).toBe('preview');
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

  describe('modes', () => {
    it('should register the edit mode as the source mode and start in it', () => {
      const view = createMarkdownView();
      expect(view.modes.source).toBe(view.editMode);
      expect(view.currentMode).toBe(view.editMode);
    });

    it('should register the preview mode as the preview mode', () => {
      const view = createMarkdownView();
      expect(view.modes.preview).toBe(view.previewMode);
    });

    it('should expose the edit mode\'s editor as its own', () => {
      const view = createMarkdownView();
      expect(view.editor).toBe(view.editMode.editor);
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

    it('should set the text through the current mode', () => {
      const view = createMarkdownView();
      view.setViewData('through the mode', false);
      expect(view.currentMode.get()).toBe('through the mode');
    });

    it('should reach every mode when clearing', () => {
      const view = createMarkdownView();
      view.setViewData('for every mode', true);
      expect(view.previewMode.get()).toBe('for every mode');
      expect(view.editMode.get()).toBe('for every mode');
    });

    it('should reach only the current mode when not clearing', () => {
      const view = createMarkdownView();
      view.setViewData('only the current mode', false);
      expect(view.previewMode.get()).toBe('');
    });

    it('should set the editor text as a change undo can revert when not clearing', () => {
      const view = createMarkdownView();
      view.setViewData('first', true);
      view.setViewData('second', false);
      view.editor.undo();
      expect(view.editor.getValue()).toBe('first');
    });

    it('should drop the editor history when clearing', () => {
      const view = createMarkdownView();
      view.setViewData('first', false);
      view.setViewData('second', true);
      view.editor.undo();
      expect(view.editor.getValue()).toBe('second');
    });

    it('should reset an editor that has no state of its own, whatever clear says', () => {
      const view = createMarkdownView();
      view.setViewData('first', false);
      view.editor.undo();
      expect(view.editor.getValue()).toBe('first');
    });

    it('should change only what differs, leaving a cursor outside it where it was', () => {
      const view = createMarkdownView();
      view.setViewData('hello world', true);
      view.editor.setCursor({ ch: 2, line: 0 });

      view.setViewData('hello brave world', false);

      expect(view.editor.getValue()).toBe('hello brave world');
      expect(view.editor.getCursor()).toEqual({ ch: 2, line: 0 });
    });

    it('should record no editor change when the text is identical', () => {
      const view = createMarkdownView();
      view.setViewData('a', true);
      view.editor.replaceRange('b', { ch: 1, line: 0 });

      view.setViewData('ab', false);
      view.editor.undo();

      expect(view.editor.getValue()).toBe('a');
    });
  });

  describe('data', () => {
    it('should read the current mode\'s text', () => {
      const view = createMarkdownView();
      view.setViewData('set through the view', false);
      expect(view.data).toBe('set through the view');
    });

    it('should see an edit made through the editor alone', () => {
      const view = createMarkdownView();
      view.setViewData('a', true);
      view.editor.replaceRange('b', { ch: 1, line: 0 });
      expect(view.data).toBe('ab');
      expect(view.getViewData()).toBe('ab');
    });

    it('should see an edit made through the edit mode alone', () => {
      const view = createMarkdownView();
      view.editMode.set('through the edit mode', true);
      expect(view.data).toBe('through the edit mode');
      expect(view.editor.getValue()).toBe('through the edit mode');
      expect(view.getViewData()).toBe('through the edit mode');
    });

    it('should write through to the current mode', () => {
      const view = createMarkdownView();
      view.data = 'assigned';
      expect(view.getViewData()).toBe('assigned');
      expect(view.editor.getValue()).toBe('assigned');
    });
  });

  describe('clear', () => {
    it('should clear data and editor', () => {
      const view = createMarkdownView();
      view.setViewData('content', false);
      view.clear();
      expect(view.getViewData()).toBe('');
      expect(view.data).toBe('');
      expect(view.editor.getValue()).toBe('');
    });

    it('should clear every mode', () => {
      const view = createMarkdownView();
      view.setViewData('content', true);
      view.clear();
      expect(view.previewMode.get()).toBe('');
      expect(view.editMode.get()).toBe('');
    });

    it('should drop the editor history', () => {
      const view = createMarkdownView();
      view.setViewData('content', false);
      view.clear();
      view.editor.undo();
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
      expect(view.getViewData()).toBe('via current mode');
    });

    it('should track scroll', () => {
      const view = createMarkdownView();
      const SCROLL_POS = 42;
      view.currentMode.applyScroll(SCROLL_POS);
      expect(view.currentMode.getScroll()).toBe(SCROLL_POS);
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

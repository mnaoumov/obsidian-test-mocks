import type { MarkdownEditView as MarkdownEditViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { MarkdownEditView } from './MarkdownEditView.ts';
import { MarkdownView } from './MarkdownView.ts';
import { TFile } from './TFile.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

function createEditView(): MarkdownEditView {
  const app = App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  const mdView = MarkdownView.create2__(leaf);
  return MarkdownEditView.create__(mdView);
}

describe('MarkdownEditView', () => {
  it('should create an instance via create__', () => {
    const editView = createEditView();
    expect(editView).toBeInstanceOf(MarkdownEditView);
  });

  it('should have app property', () => {
    const editView = createEditView();
    expect(editView.app).toBeDefined();
  });

  describe('get / set', () => {
    it('should set and get data', () => {
      const editView = createEditView();
      editView.set('hello world', false);
      expect(editView.get()).toBe('hello world');
    });

    it('should set the text as a change undo can revert when not clearing', () => {
      const editView = createEditView();
      editView.set('first', true);
      editView.set('second', false);
      editView.editor__.undo();
      expect(editView.get()).toBe('first');
    });

    it('should drop the history when clearing', () => {
      const editView = createEditView();
      editView.set('first', false);
      editView.set('second', true);
      editView.editor__.undo();
      expect(editView.get()).toBe('second');
    });

    it('should reset an editor that has no state of its own, whatever clear says', () => {
      const editView = createEditView();
      editView.set('first', false);
      editView.editor__.undo();
      expect(editView.get()).toBe('first');
    });

    it('should change only what differs, leaving a cursor outside it where it was', () => {
      const editView = createEditView();
      editView.set('hello world', true);
      editView.editor__.setCursor({ ch: 2, line: 0 });

      editView.set('hello brave world', false);

      expect(editView.get()).toBe('hello brave world');
      expect(editView.editor__.getCursor()).toEqual({ ch: 2, line: 0 });
    });

    it('should record no change when the text is identical', () => {
      const editView = createEditView();
      editView.set('a', true);
      editView.editor__.replaceRange('b', { ch: 1, line: 0 });

      editView.set('ab', false);
      editView.editor__.undo();

      expect(editView.get()).toBe('a');
    });

    it('should diff rather than reset once clear has given the editor a state', () => {
      const editView = createEditView();
      editView.clear();

      editView.set('fresh', false);
      editView.editor__.undo();

      expect(editView.get()).toBe('');
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const editView = createEditView();
      editView.set('content', false);
      editView.clear();
      expect(editView.get()).toBe('');
    });

    it('should drop the history', () => {
      const editView = createEditView();
      editView.set('content', false);
      editView.clear();
      editView.editor__.undo();
      expect(editView.get()).toBe('');
    });
  });

  describe('file', () => {
    it('should return the underlying view file', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const mdView = MarkdownView.create2__(leaf);
      const file = TFile.create__(app.vault, 'test.md');
      mdView.file = file;
      const editView = MarkdownEditView.create__(mdView);
      expect(editView.file).toBe(file);
    });
  });

  describe('getSelection', () => {
    it('should return editor selection', () => {
      const editView = createEditView();
      expect(editView.getSelection()).toBe('');
    });
  });

  describe('applyScroll / getScroll', () => {
    it('should set and get scroll position', () => {
      const editView = createEditView();
      const SCROLL_POS = 150;
      editView.applyScroll(SCROLL_POS);
      expect(editView.getScroll()).toBe(SCROLL_POS);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const editView = createEditView();
      const original: MarkdownEditViewOriginal = editView.asOriginalType__();
      expect(original).toBe(editView);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const editView = createEditView();
      const mock = MarkdownEditView.fromOriginalType__(editView.asOriginalType__());
      expect(mock).toBe(editView);
    });
  });
});

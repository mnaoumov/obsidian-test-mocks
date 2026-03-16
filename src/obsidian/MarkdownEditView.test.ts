import type { MarkdownEditView as MarkdownEditViewOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { MarkdownEditView } from './MarkdownEditView.ts';
import { MarkdownView } from './MarkdownView.ts';
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
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const editView = createEditView();
      editView.set('content', false);
      editView.clear();
      expect(editView.get()).toBe('');
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

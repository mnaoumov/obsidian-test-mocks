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

async function createEditView(): Promise<MarkdownEditView> {
  const app = await App.createConfigured__();
  const leaf = WorkspaceLeaf.create2__(app);
  const mdView = MarkdownView.create2__(leaf);
  return MarkdownEditView.create__(mdView);
}

describe('MarkdownEditView', () => {
  it('should create an instance via create__', async () => {
    const editView = await createEditView();
    expect(editView).toBeInstanceOf(MarkdownEditView);
  });

  it('should have app property', async () => {
    const editView = await createEditView();
    expect(editView.app).toBeDefined();
  });

  describe('get / set', () => {
    it('should set and get data', async () => {
      const editView = await createEditView();
      editView.set('hello world', false);
      expect(editView.get()).toBe('hello world');
    });
  });

  describe('clear', () => {
    it('should clear the content', async () => {
      const editView = await createEditView();
      editView.set('content', false);
      editView.clear();
      expect(editView.get()).toBe('');
    });
  });

  describe('getSelection', () => {
    it('should return editor selection', async () => {
      const editView = await createEditView();
      expect(editView.getSelection()).toBe('');
    });
  });

  describe('applyScroll / getScroll', () => {
    it('should set and get scroll position', async () => {
      const editView = await createEditView();
      const SCROLL_POS = 150;
      editView.applyScroll(SCROLL_POS);
      expect(editView.getScroll()).toBe(SCROLL_POS);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const editView = await createEditView();
      const original: MarkdownEditViewOriginal = editView.asOriginalType__();
      expect(original).toBe(editView);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const editView = await createEditView();
      const mock = MarkdownEditView.fromOriginalType__(editView.asOriginalType__());
      expect(mock).toBe(editView);
    });
  });
});

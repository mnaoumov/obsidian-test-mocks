import type { MarkdownRenderer as MarkdownRendererOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { Component } from '../../src/obsidian/Component.ts';
import { MarkdownPreviewView } from '../../src/obsidian/MarkdownPreviewView.ts';
import { MarkdownRenderer } from '../../src/obsidian/MarkdownRenderer.ts';
import { MarkdownView } from '../../src/obsidian/MarkdownView.ts';
import { WorkspaceLeaf } from '../../src/obsidian/WorkspaceLeaf.ts';

describe('MarkdownRenderer', () => {
  describe('render', () => {
    it('should resolve without error', async () => {
      const app = await App.createConfigured__();
      const el = createDiv();
      const component = new (class extends Component {})();
      await expect(MarkdownRenderer.render(app, '# Hello', el, '', component)).resolves.toBeUndefined();
    });
  });

  describe('renderMarkdown', () => {
    it('should resolve without error', async () => {
      const el = createDiv();
      const component = new (class extends Component {})();
      await expect(MarkdownRenderer.renderMarkdown('**bold**', el, '', component)).resolves.toBeUndefined();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const mdView = MarkdownView.create2__(leaf);
      const renderer = MarkdownPreviewView.create3__(mdView);
      const original: MarkdownRendererOriginal = renderer.asOriginalType__();
      expect(original).toBe(renderer);
    });
  });
});

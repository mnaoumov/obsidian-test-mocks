import type { MarkdownRenderer as MarkdownRendererOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { TFile } from './TFile.ts';

import { App } from './App.ts';
import { Component } from './Component.ts';
import { MarkdownPreviewView } from './MarkdownPreviewView.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';
import { MarkdownView } from './MarkdownView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class ConcreteMarkdownRenderer extends MarkdownRenderer {
  public get file(): TFile {
    return {} as TFile;
  }

  public constructor(app: App, containerEl: HTMLElement) {
    super(app, containerEl);
  }
}

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

    it('should return the same instance via MarkdownRenderer base class', async () => {
      const app = await App.createConfigured__();
      const renderer = new ConcreteMarkdownRenderer(app, createDiv());
      const original: MarkdownRendererOriginal = renderer.asOriginalType__();
      expect(original).toBe(renderer);
    });
  });

  describe('constructor3__', () => {
    it('should be callable without throwing', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const mdView = MarkdownView.create2__(leaf);
      const renderer = MarkdownPreviewView.create3__(mdView);
      expect(() => {
        renderer.constructor3__(app, createDiv());
      }).not.toThrow();
    });
  });
});

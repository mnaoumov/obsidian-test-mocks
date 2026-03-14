import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { Component } from '../../src/obsidian/Component.ts';
import { MarkdownRenderer } from '../../src/obsidian/MarkdownRenderer.ts';

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
});

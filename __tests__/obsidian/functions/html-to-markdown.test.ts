import {
  describe,
  expect,
  it
} from 'vitest';

import { htmlToMarkdown } from '../../../src/obsidian/functions/htmlToMarkdown.ts';

describe('htmlToMarkdown', () => {
  it('should convert an HTML string to markdown', () => {
    const result = htmlToMarkdown('<p>Hello</p>');
    expect(result).toContain('Hello');
  });

  it('should convert an HTMLElement to markdown', () => {
    const el = document.createElement('p');
    el.textContent = 'World';
    const result = htmlToMarkdown(el);
    expect(result).toContain('World');
  });

  it('should convert a DocumentFragment to markdown', () => {
    const fragment = document.createDocumentFragment();
    const p = document.createElement('p');
    p.textContent = 'Fragment';
    fragment.appendChild(p);
    const result = htmlToMarkdown(fragment);
    expect(result).toContain('Fragment');
  });

  it('should convert a Document to markdown', () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.body.innerHTML = '<p>Doc content</p>';
    const result = htmlToMarkdown(doc);
    expect(result).toContain('Doc content');
  });
});

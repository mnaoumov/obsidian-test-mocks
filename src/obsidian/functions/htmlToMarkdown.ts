/**
 * @file
 *
 * Mock of Obsidian's `htmlToMarkdown`, backed by the Turndown library.
 */

import TurndownService from 'turndown';

import { sanitizeHTMLToDom } from './sanitizeHTMLToDom.ts';

const turndownService = new TurndownService();

/**
 * Converts HTML to Markdown. The mock uses Turndown with its default options, so its output can differ from
 * Obsidian's in the finer details.
 *
 * @param html - The HTML to convert: a string, an element, a fragment (which is cloned) or a whole document (whose
 * body is used).
 * @returns The Markdown text.
 */
export function htmlToMarkdown(html: Document | DocumentFragment | HTMLElement | string): string {
  if (typeof html === 'string') {
    return turndownService.turndown(html);
  }

  if (html instanceof HTMLElement) {
    return turndownService.turndown(html);
  }

  const wrapper = createDiv();
  if (html instanceof Document) {
    wrapper.append(sanitizeHTMLToDom(html.body.innerHTML));
  } else {
    wrapper.append(html.cloneNode(true));
  }
  return turndownService.turndown(wrapper);
}

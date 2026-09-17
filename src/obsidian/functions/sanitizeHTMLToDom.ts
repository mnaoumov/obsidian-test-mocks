/**
 * @file
 *
 * Mock of Obsidian's `sanitizeHTMLToDom`.
 */

import { sanitizeHtml } from '../../internal/html-sanitizer.ts';

/**
 * Parses HTML into a document fragment, stripping unsafe content, as Obsidian does. Obsidian runs DOMPurify with
 * unknown URL protocols allowed, `style` forbidden, `iframe` and a few iframe attributes added, then points every link
 * at a new window (`target="_blank"`, and `rel="noopener nofollow"` when it has no `rel`) and restricts an iframe's
 * `sandbox` and `allow` tokens. The mock ports those passes: disallowed elements are removed (keeping their text,
 * except for elements such as `script` whose content is dropped too), and disallowed attributes, event handlers and
 * `javascript:` / `data:` URLs are stripped.
 *
 * @param html - The HTML to parse.
 * @returns The sanitized content, owned by the global `document`.
 */
export function sanitizeHTMLToDom(html: string): DocumentFragment {
  return sanitizeHtml(html);
}

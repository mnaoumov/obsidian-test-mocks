/**
 * @file
 *
 * Mock of Obsidian's `sanitizeHTMLToDom`.
 */

/**
 * Parses HTML into a document fragment, stripping unsafe content. The mock parses through a `template` element and
 * does not sanitize anything.
 *
 * @param html - The HTML to parse.
 * @returns The parsed content.
 */
export function sanitizeHTMLToDom(html: string): DocumentFragment {
  const template = createEl('template');
  template.innerHTML = html;
  return template.content;
}

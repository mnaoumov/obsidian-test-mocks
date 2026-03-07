export function htmlToMarkdown(html: string | HTMLElement | Document | DocumentFragment): string {
  if (typeof html === 'string') {
    return html;
  }
  return html.textContent ?? '';
}

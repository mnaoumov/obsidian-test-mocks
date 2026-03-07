export function htmlToMarkdown(_html: string | HTMLElement | Document | DocumentFragment): string {
  if (typeof _html === 'string') {
    return _html;
  }
  return _html.textContent ?? '';
}

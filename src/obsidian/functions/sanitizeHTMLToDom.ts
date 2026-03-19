export function sanitizeHTMLToDom(html: string): DocumentFragment {
  const template = createEl('template');
  template.innerHTML = html;
  return template.content;
}

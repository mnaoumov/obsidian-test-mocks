import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function htmlToMarkdown(html: Document | DocumentFragment | HTMLElement | string): string {
  if (typeof html === 'string') {
    return turndownService.turndown(html);
  }

  if (html instanceof HTMLElement) {
    return turndownService.turndown(html);
  }

  const wrapper = createDiv();
  if (html instanceof Document) {
    wrapper.innerHTML = html.body.innerHTML;
  } else {
    wrapper.appendChild(html.cloneNode(true));
  }
  return turndownService.turndown(wrapper);
}

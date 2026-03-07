import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string | HTMLElement | Document | DocumentFragment): string {
  if (typeof html === 'string') {
    return turndownService.turndown(html);
  }

  if (html instanceof HTMLElement) {
    return turndownService.turndown(html);
  }

  const wrapper = document.createElement('div');
  if (html instanceof Document) {
    if (html.body) {
      wrapper.innerHTML = html.body.innerHTML;
    }
  } else {
    wrapper.appendChild(html.cloneNode(true));
  }
  return turndownService.turndown(wrapper);
}

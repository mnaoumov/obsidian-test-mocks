import type { TooltipOptions } from 'obsidian';

export function displayTooltip(el: HTMLElement, content: DocumentFragment | string, _options?: TooltipOptions): void {
  el.createEl('span', {
    cls: 'tooltip',
    text: content
  });
}

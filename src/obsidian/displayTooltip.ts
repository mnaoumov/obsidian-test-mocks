import type { TooltipOptions as TooltipOptionsOriginal } from 'obsidian';

export function displayTooltip(el: HTMLElement, content: DocumentFragment | string, _options?: TooltipOptionsOriginal): void {
  el.createEl('span', {
    cls: 'tooltip',
    text: content
  });
}

import type { TooltipOptions as TooltipOptionsOriginal } from 'obsidian';

export function displayTooltip(newTargetEl: HTMLElement, content: DocumentFragment | string, _options?: TooltipOptionsOriginal): void {
  newTargetEl.createEl('span', {
    cls: 'tooltip',
    text: content
  });
}

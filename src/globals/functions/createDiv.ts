import { createEl } from './createEl.ts';

export function createDiv(
  o?: DomElementInfo | string,
  callback?: (el: HTMLDivElement) => void
): HTMLDivElement {
  return createEl('div', o, callback);
}

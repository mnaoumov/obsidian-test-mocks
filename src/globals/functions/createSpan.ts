import { createEl } from './createEl.ts';

export function createSpan(
  o?: DomElementInfo | string,
  callback?: (el: HTMLSpanElement) => void
): HTMLSpanElement {
  return createEl('span', o, callback);
}

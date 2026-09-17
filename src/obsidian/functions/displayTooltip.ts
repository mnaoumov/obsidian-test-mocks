/**
 * @file
 *
 * Mock of Obsidian's `displayTooltip`.
 */

import type { TooltipOptions as TooltipOptionsOriginal } from 'obsidian';

/**
 * Shows a tooltip over an element right away, rather than on hover as `setTooltip` does. The mock appends a
 * `span.tooltip` holding the content inside the target element, and ignores the options.
 *
 * @param newTargetEl - The element to show the tooltip over.
 * @param content - The tooltip content.
 * @param _options - The tooltip placement and appearance options.
 */
export function displayTooltip(newTargetEl: HTMLElement, content: DocumentFragment | string, _options?: TooltipOptionsOriginal): void {
  newTargetEl.createEl('span', {
    cls: 'tooltip',
    text: content
  });
}

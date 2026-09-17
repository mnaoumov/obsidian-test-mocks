/**
 * @file
 *
 * Mock of Obsidian's `setTooltip`.
 */

import { noop } from '../../internal/noop.ts';

/**
 * Attaches a tooltip that appears when hovering over an element. A no-op in the mock.
 *
 * @param _el - The element to show the tooltip on.
 * @param _tooltip - The tooltip text.
 * @param _options - The tooltip placement and appearance options.
 */
export function setTooltip(_el: HTMLElement, _tooltip: string, _options?: unknown): void {
  noop();
}

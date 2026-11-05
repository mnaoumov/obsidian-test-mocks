/**
 * @file
 *
 * Mock of Obsidian's `setTooltip`.
 */

import type { TooltipOptions as TooltipOptionsOriginal } from 'obsidian';

/**
 * Attaches a tooltip to an element, as Obsidian does: the text goes to the element's `aria-label`, which is what
 * Obsidian's hover handler reads, and each option that is set goes to a `data-tooltip-*` attribute the handler reads
 * too. A `placement` of `bottom` is the default and writes nothing, and a falsy `delay` or `gap` writes nothing. An
 * attribute is never removed, so options left out of a later call keep the earlier call's values, as in Obsidian.
 *
 * Obsidian also re-shows the tooltip when it is on screen for this element at the time of the call; the mock shows
 * no tooltips, so there is nothing to re-show.
 *
 * @param el - The element to show the tooltip on.
 * @param tooltip - The tooltip text.
 * @param options - The tooltip placement and appearance options.
 */
export function setTooltip(el: HTMLElement, tooltip: string, options?: TooltipOptionsOriginal): void {
  el.setAttribute('aria-label', tooltip);
  const { classes, delay, gap, placement } = options ?? {};
  if (placement && placement !== 'bottom') {
    el.dataset['tooltipPosition'] = placement;
  }
  if (classes) {
    el.dataset['tooltipClasses'] = classes.join(' ');
  }
  if (delay) {
    el.dataset['tooltipDelay'] = String(delay);
  }
  if (gap) {
    el.dataset['tooltipGap'] = String(gap);
  }
}

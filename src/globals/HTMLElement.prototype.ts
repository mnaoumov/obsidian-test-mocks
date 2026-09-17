/**
 * @file
 *
 * Mocks of the lookup, visibility, style and event helpers Obsidian adds to `HTMLElement.prototype`.
 */

import {
  delegatedOff,
  delegatedOn
} from '../internal/delegated-event-registry.ts';
import { noop } from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

/**
 * Finds the first descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The first matching element. The mock throws when nothing matches.
 */
export function find(this: HTMLElement, selector: string): HTMLElement {
  return ensureNonNullable(this.querySelector(selector));
}

/**
 * Finds every descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The matching elements, in document order.
 */
export function findAll(this: HTMLElement, selector: string): HTMLElement[] {
  return [...this.querySelectorAll<HTMLElement>(selector)];
}

/**
 * Finds every element matching a selector, including the element itself.
 *
 * @param selector - The CSS selector to match.
 * @returns The element itself first when it matches, followed by the matching descendants.
 */
export function findAllSelf(this: HTMLElement, selector: string): HTMLElement[] {
  return [...(this.matches(selector) ? [this] : []), ...this.querySelectorAll<HTMLElement>(selector)];
}

/**
 * Hides the element by setting its inline `display` to `none`.
 */
export function hide(this: HTMLElement): void {
  this.style.display = 'none';
}

/**
 * Checks whether the element is shown: attached to the DOM with no ancestor hidden by `display: none`. The mock
 * relies on `offsetParent`, which jsdom leaves `null`, so it reports `false` unless a test defines `offsetParent`.
 *
 * @returns `true` when the element has an offset parent.
 */
export function isShown(this: HTMLElement): boolean {
  return !!this.offsetParent;
}

/**
 * Removes a delegated event listener registered with {@link on}.
 *
 * @param type - The event type the listener was registered for.
 * @param _selector - The selector the listener was registered with. Ignored by the mock, which looks the listener
 * up by event type and listener alone.
 * @param listener - The listener to remove.
 * @param options - The options the listener was registered with, passed on to `removeEventListener`.
 */
export function off(
  this: HTMLElement,
  type: string,
  _selector: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOff(this, type, listener, options);
}

/**
 * Adds a delegated event listener: Obsidian calls it only for events whose target matches `selector`, passing the
 * matching element as `delegateTarget`. The mock ignores the selector and calls the listener for every event, with
 * the event target as `delegateTarget`.
 *
 * @param type - The event type to listen for.
 * @param _selector - The CSS selector events are filtered by. Ignored by the mock.
 * @param listener - The listener to call, with the element as `this`.
 * @param options - Standard `addEventListener` options.
 */
export function on(
  this: HTMLElement,
  type: string,
  _selector: string,
  listener: (this: HTMLElement, event: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOn(this, type, listener, options);
}

/**
 * Listens for clicks on the element. The mock registers a plain `click` listener, which cannot be removed.
 *
 * @param listener - The listener to call with each click, with the element as `this`.
 * @param options - Standard `addEventListener` options.
 */
export function onClickEvent(
  this: HTMLElement,
  listener: (this: HTMLElement, event: MouseEvent) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  this.addEventListener('click', (event: Event) => {
    listener.call(this, event as MouseEvent);
  }, options);
}

/**
 * Calls a listener when the element is inserted into the DOM. The mock observes nothing: it calls the listener once,
 * immediately.
 *
 * @param listener - The callback to call when the element is inserted.
 * @param _once - Whether the listener fires only once. Unused by the mock.
 * @returns A function that removes the handler; a no-op in the mock.
 */
export function onNodeInserted(
  this: HTMLElement,
  listener: () => unknown,
  _once?: boolean
): () => void {
  // Jsdom doesn't implement real insertion observers; invoke immediately for safety.
  listener();
  return noop;
}

/**
 * Calls a listener when the element is migrated to another window. The mock never calls it, since tests have a
 * single window.
 *
 * @param _listener - The callback to call with the new window. Never called by the mock.
 * @returns A function that removes the handler; a no-op in the mock.
 */
export function onWindowMigrated(
  this: HTMLElement,
  _listener: (win: Window) => unknown
): () => void {
  return noop;
}

/**
 * Sets CSS properties, including custom properties such as `--size`, on the element's inline style.
 *
 * @param props - Property names mapped to the values to set.
 */
export function setCssProps(this: HTMLElement, props: Record<string, string>): void {
  for (const [k, v] of Object.entries(props)) {
    this.style.setProperty(k, v);
  }
}

/**
 * Assigns camelCase style declarations to the element's inline style.
 *
 * @param styles - The style declarations to assign.
 */
export function setCssStyles(this: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(this.style, styles);
}

/**
 * Shows the element by clearing its inline `display`.
 */
export function show(this: HTMLElement): void {
  this.style.display = '';
}

/**
 * Shows or hides the element through its inline `display`.
 *
 * @param showValue - `true` to show the element, `false` to hide it.
 */
export function toggle(this: HTMLElement, showValue: boolean): void {
  this.style.display = showValue ? '' : 'none';
}

/**
 * Shows or hides the element through its inline `visibility`, so it keeps its place in the layout.
 *
 * @param visible - `true` for `visible`, `false` for `hidden`.
 */
export function toggleVisibility(this: HTMLElement, visible: boolean): void {
  this.style.visibility = visible ? 'visible' : 'hidden';
}

/**
 * Dispatches a bubbling, cancelable event of the given type on the element.
 *
 * @param eventType - The event type to dispatch, such as `change`.
 */
export function trigger(this: HTMLElement, eventType: string): void {
  this.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
}

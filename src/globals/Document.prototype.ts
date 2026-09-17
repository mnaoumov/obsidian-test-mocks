/**
 * @file
 *
 * Mocks of the delegated event helpers Obsidian adds to `Document.prototype`.
 */

import {
  delegatedOff,
  delegatedOn
} from '../internal/delegated-event-registry.ts';

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
  this: Document,
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
 * @param listener - The listener to call, with the document as `this`.
 * @param options - Standard `addEventListener` options.
 */
export function on(
  this: Document,
  type: string,
  _selector: string,
  listener: (this: Document, event: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOn(this, type, listener, options);
}

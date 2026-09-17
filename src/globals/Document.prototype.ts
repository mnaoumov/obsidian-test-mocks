/**
 * @file
 *
 * Mocks of the delegated event helpers Obsidian adds to `Document.prototype`.
 */

import type { DelegatedListener } from '../internal/delegated-event-registry.ts';

import {
  delegatedOff,
  delegatedOn
} from '../internal/delegated-event-registry.ts';

/**
 * Removes a delegated event listener registered with {@link on}. As in Obsidian, every registration whose selector,
 * listener and options are all identical to the ones given is removed.
 *
 * @param type - The event type the listener was registered for.
 * @param selector - The selector the listener was registered with.
 * @param listener - The listener to remove.
 * @param options - The options the listener was registered with, compared by identity.
 */
export function off(
  this: Document,
  type: string,
  selector: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOff(this, type, selector, listener, options);
}

/**
 * Adds a delegated event listener, as Obsidian does: it is called only for events whose target, or an ancestor of
 * it up to this document, matches `selector`, with that matching element as `delegateTarget`. The registration is
 * kept in `_EVENTS`.
 *
 * @param type - The event type to listen for.
 * @param selector - The CSS selector events are filtered by.
 * @param listener - The listener to call, with the document as `this`.
 * @param options - Standard `addEventListener` options.
 */
export function on(
  this: Document,
  type: string,
  selector: string,
  listener: DelegatedListener<Document>,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOn(this, type, selector, listener, options);
}

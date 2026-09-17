/**
 * @file
 *
 * Shared implementation of the delegated `on` / `off` helpers Obsidian adds to `Document.prototype` and
 * `HTMLElement.prototype`. As in Obsidian, every registration is kept on the target's own `_EVENTS` record, keyed by
 * event type, so it can be found and removed again.
 */

import type { EventListenerInfo } from './types.ts';

import { castTo } from './castTo.ts';

/**
 * A listener as the delegated helpers call it: with the target as `this`, the event, and the element that matched
 * the selector.
 *
 * @typeParam T - The event target's type, bound as the listener's `this`.
 */
export type DelegatedListener<T extends EventTarget> = (this: T, event: Event, delegateTarget: HTMLElement) => unknown;

interface DelegatedEventTarget extends EventTarget {
  _EVENTS?: Record<string, EventListenerInfo[]>;
}

interface MatchParentElement {
  matchParent?(selector: string, lastParent?: Element): Element | null;
}

/**
 * Removes every registration whose selector, listener and options are all identical to the ones given, detaching
 * each wrapper it added; does nothing when there is none.
 *
 * @param target - The target the listener was added to.
 * @param type - The event type the listener was registered for.
 * @param selector - The selector the listener was registered with.
 * @param listener - The original listener, as passed to {@link delegatedOn}.
 * @param options - The options the listener was registered with, compared by identity.
 */
export function delegatedOff(
  target: EventTarget,
  type: string,
  selector: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  const events = castTo<DelegatedEventTarget>(target)._EVENTS;
  const infos = events?.[type];
  if (!events || !infos) {
    return;
  }
  events[type] = infos.filter((info) => {
    if (info.selector !== selector || info.listener !== listener || info.options !== options) {
      return true;
    }
    target.removeEventListener(type, info.callback, options);
    return false;
  });
}

/**
 * Adds a delegated listener, as Obsidian does. Each event of `type` is matched with
 * `event.target.matchParent(selector, event.currentTarget)`: when the event target or one of its ancestors up to the
 * listening target matches, the listener is called with `target` as `this`, the event, and that element. Events
 * whose target has no `matchParent` (a text node, the document itself) are ignored.
 *
 * Every call adds a new registration, so registering the same listener twice calls it twice.
 *
 * @typeParam T - The event target's type, bound as the listener's `this`.
 * @param target - The target to listen on.
 * @param type - The event type to listen for.
 * @param selector - The CSS selector the event target, or an ancestor of it, must match.
 * @param listener - The listener to call.
 * @param options - Options passed on to `addEventListener`.
 */
export function delegatedOn<T extends EventTarget>(
  target: T,
  type: string,
  selector: string,
  listener: DelegatedListener<T>,
  options?: AddEventListenerOptions | boolean
): void {
  function callback(event: Event): void {
    const eventTarget = castTo<MatchParentElement | null>(event.target);
    if (!eventTarget?.matchParent) {
      return;
    }
    const delegateTarget = eventTarget.matchParent(selector, castTo<Element>(event.currentTarget));
    if (delegateTarget) {
      listener.call(target, event, castTo<HTMLElement>(delegateTarget));
    }
  }
  const delegatedTarget = castTo<DelegatedEventTarget>(target);
  delegatedTarget._EVENTS ??= {};
  delegatedTarget._EVENTS[type] ??= [];
  delegatedTarget._EVENTS[type].push({ callback, listener, options, selector });
  target.addEventListener(type, callback, options);
}

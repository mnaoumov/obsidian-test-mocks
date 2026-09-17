/**
 * @file
 *
 * Shared registry behind the mocked delegated `on` / `off` helpers, remembering the wrapper each listener was
 * registered through so it can be removed again.
 */

const listenerMap = new WeakMap<EventTarget, Map<string, Map<unknown, EventListener>>>();

/**
 * Removes a listener added with {@link delegatedOn}; does nothing when it was never registered for `type`.
 *
 * @param target - The target the listener was added to.
 * @param type - The event type the listener was registered for.
 * @param listener - The original listener, as passed to {@link delegatedOn}.
 * @param options - Options passed on to `removeEventListener`.
 */
export function delegatedOff(
  target: EventTarget,
  type: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  const map = getMap(target);
  const byType = map.get(type);
  if (!byType) {
    return;
  }
  const wrapped = byType.get(listener);
  if (!wrapped) {
    return;
  }
  target.removeEventListener(type, wrapped, options);
  byType.delete(listener);
}

/**
 * Adds a listener that is called with `target` as `this` and the event target as its delegate target. No selector
 * filtering happens: the listener sees every event of `type`.
 *
 * @typeParam T - The event target's type, bound as the listener's `this`.
 * @param target - The target to listen on.
 * @param type - The event type to listen for.
 * @param listener - The listener to call.
 * @param options - Options passed on to `addEventListener`.
 */
export function delegatedOn<T extends EventTarget>(
  target: T,
  type: string,
  listener: (this: T, event: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  function callback(event: Event): void {
    listener.call(target, event, event.target as HTMLElement);
  }
  const map = getMap(target);
  let byType = map.get(type);
  if (!byType) {
    byType = new Map();
    map.set(type, byType);
  }
  byType.set(listener, callback);
  target.addEventListener(type, callback, options);
}

function getMap(target: EventTarget): Map<string, Map<unknown, EventListener>> {
  let map = listenerMap.get(target);
  if (!map) {
    map = new Map();
    listenerMap.set(target, map);
  }
  return map;
}

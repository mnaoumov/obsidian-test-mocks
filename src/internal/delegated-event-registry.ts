const listenerMap = new WeakMap<EventTarget, Map<string, Map<unknown, EventListener>>>();

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

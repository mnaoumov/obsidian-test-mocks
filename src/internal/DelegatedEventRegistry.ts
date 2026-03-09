const listenerMap = new WeakMap<EventTarget, Map<string, Map<unknown, EventListener>>>();

export function delegatedOff(
  target: EventTarget,
  type: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  const map = getMap(target);
  const byType = map.get(type);
  if (!byType) return;
  const wrapped = byType.get(listener);
  if (!wrapped) return;
  target.removeEventListener(type, wrapped, options);
  byType.delete(listener);
}

export function delegatedOn<T extends EventTarget>(
  target: T,
  type: string,
  listener: (this: T, ev: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  function cb(ev: Event): void {
    listener.call(target, ev, ev.target as HTMLElement);
  }
  const map = getMap(target);
  let byType = map.get(type);
  if (!byType) {
    byType = new Map();
    map.set(type, byType);
  }
  byType.set(listener, cb);
  target.addEventListener(type, cb, options);
}

function getMap(target: EventTarget): Map<string, Map<unknown, EventListener>> {
  let map = listenerMap.get(target);
  if (!map) {
    map = new Map();
    listenerMap.set(target, map);
  }
  return map;
}

import type { Debouncer as DebouncerOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

export function debounce<T extends unknown[], V>(cb: (...args: [...T]) => V, timeout = 0, resetTimer = true): DebouncerOriginal<T, V> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: [...T] | undefined;

  function debouncer(...args: [...T]): DebouncerOriginal<T, V> {
    lastArgs = args;
    if (resetTimer && timerId !== undefined) {
      clearTimeout(timerId);
    }
    if (timerId === undefined || resetTimer) {
      timerId = setTimeout(() => {
        timerId = undefined;
        cb(...args);
      }, timeout);
    }
    return debouncer;
  }

  debouncer.cancel = (): DebouncerOriginal<T, V> => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    return debouncer;
  };

  debouncer.run = (): MaybeReturn<V> => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    if (lastArgs) {
      return cb(...lastArgs);
    }
  };

  return debouncer;
}

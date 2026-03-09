import type { Debouncer } from 'obsidian';

import type { MaybeReturn } from '../internal/types.ts';

export function debounce<T extends unknown[], V>(cb: (...args: [...T]) => V, timeout = 0, resetTimer = true): Debouncer<T, V> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: [...T] | undefined;

  function debouncer(...args: [...T]): Debouncer<T, V> {
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
    return debouncer as Debouncer<T, V>;
  }

  debouncer.cancel = (): Debouncer<T, V> => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    return debouncer as Debouncer<T, V>;
  };

  debouncer.run = (): MaybeReturn<V> => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    if (lastArgs) {
      return cb(...lastArgs) as MaybeReturn<V>;
    }
  };

  return debouncer as Debouncer<T, V>;
}

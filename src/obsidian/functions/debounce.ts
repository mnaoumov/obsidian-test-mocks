import type { Debouncer as DebouncerOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

export function debounce<T extends unknown[], V>(callback: (...$arguments: [...T]) => V, timeout = 0, resetTimer = true): DebouncerOriginal<T, V> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArguments: [...T] | undefined;

  function debouncer(...$arguments: [...T]): DebouncerOriginal<T, V> {
    lastArguments = $arguments;
    if (resetTimer && timerId !== undefined) {
      clearTimeout(timerId);
    }
    if (timerId === undefined || resetTimer) {
      timerId = setTimeout(() => {
        timerId = undefined;
        callback(...$arguments);
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
    if (lastArguments) {
      return callback(...lastArguments);
    }
  };

  return debouncer;
}

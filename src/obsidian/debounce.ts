import type { Debouncer } from 'obsidian';

import type { MaybeReturn } from '../internal/Types.ts';

export function debounce<T extends unknown[], V>(cb: (...args: [...T]) => V, _timeout?: number, _resetTimer?: boolean): Debouncer<T, V> {
  let lastArgs: [...T] | undefined;
  function debouncer(...args: [...T]): Debouncer<T, V> {
    lastArgs = args;
    cb(...args);
    return debouncer as Debouncer<T, V>;
  }
  debouncer.cancel = (): Debouncer<T, V> => debouncer as Debouncer<T, V>;
  debouncer.run = (): MaybeReturn<V> => {
    if (lastArgs) {
      return cb(...lastArgs) as MaybeReturn<V>;
    }
  };
  return debouncer as Debouncer<T, V>;
}

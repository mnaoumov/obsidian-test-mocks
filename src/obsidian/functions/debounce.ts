/**
 * @file
 *
 * Mock of Obsidian's `debounce`, implemented on real timers.
 */

import type { Debouncer as DebouncerOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

/**
 * Creates a debounced function that delays calling `callback` until `timeout` milliseconds have passed. The
 * returned debouncer also has `cancel()`, which clears a pending call, and `run()`, which clears the timer and calls
 * `callback` at once with the last arguments it was given.
 *
 * The mock schedules with `setTimeout`, so tests can drive it with fake timers.
 *
 * @typeParam T - The parameter types of the callback.
 * @typeParam V - The return type of the callback.
 * @param callback - The function to debounce.
 * @param timeout - The delay, in milliseconds.
 * @param resetTimer - Whether a new call restarts the delay; when `false`, calls made while one is pending do not
 * schedule another.
 * @returns The debounced function, which returns itself so calls can be chained.
 */
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

/**
 * @file
 *
 * Mock of Obsidian's `debounce`, implemented on real timers.
 */

import type { Debouncer as DebouncerOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

import { ensureNonNullable } from '../../internal/type-guards.ts';

/**
 * Creates a debounced function that delays calling `callback` until `timeout` milliseconds have passed since the
 * first pending call. Each call replaces the pending `this` and arguments, so the callback always runs with the
 * latest ones. The returned debouncer also has `cancel()`, which clears the pending timer, and `run()`, which
 * calls `callback` at once when a call is pending.
 *
 * As in Obsidian, a call made while one is pending never schedules a second timer. With `resetTimer`, it pushes
 * the deadline back to `timeout` milliseconds after that call instead.
 *
 * The mock schedules with `setTimeout` and reads `Date.now()`, so tests can drive it with fake timers. Obsidian
 * also reschedules a pending timer when the active window changes; the mock has one window, so it does not.
 *
 * @typeParam T - The parameter types of the callback.
 * @typeParam V - The return type of the callback.
 * @param callback - The function to debounce.
 * @param timeout - The delay, in milliseconds.
 * @param resetTimer - Whether a call made while one is pending pushes the deadline back. Defaults to `false`, as in
 * Obsidian.
 * @returns The debounced function, which returns itself so calls can be chained.
 */
export function debounce<T extends unknown[], V>(callback: (...$arguments: [...T]) => V, timeout = 0, resetTimer = false): DebouncerOriginal<T, V> {
  let timerId: null | ReturnType<typeof setTimeout> = null;
  let pendingThis: unknown = null;
  let pendingArguments: [...T] | null = null;
  let deadline = 0;

  function invoke(): V {
    const thisArgument = pendingThis;
    const $arguments = ensureNonNullable(pendingArguments);
    pendingThis = null;
    pendingArguments = null;
    return callback.apply(thisArgument, $arguments);
  }

  function setPending(thisArgument: unknown, $arguments: [...T]): void {
    pendingThis = thisArgument;
    pendingArguments = $arguments;
  }

  function onTimeout(): void {
    if (deadline !== 0) {
      const now = Date.now();
      if (now < deadline) {
        timerId = setTimeout(onTimeout, deadline - now);
        deadline = 0;
        return;
      }
    }
    timerId = null;
    invoke();
  }

  function debouncer(this: unknown, ...$arguments: [...T]): DebouncerOriginal<T, V> {
    setPending(this, $arguments);
    if (timerId === null) {
      timerId = setTimeout(onTimeout, timeout);
    } else if (resetTimer) {
      deadline = Date.now() + timeout;
    }
    return debouncer;
  }

  debouncer.cancel = (): DebouncerOriginal<T, V> => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    return debouncer;
  };

  debouncer.run = (): MaybeReturn<V> => {
    if (timerId === null) {
      return;
    }
    clearTimeout(timerId);
    timerId = null;
    return invoke();
  };

  return debouncer;
}

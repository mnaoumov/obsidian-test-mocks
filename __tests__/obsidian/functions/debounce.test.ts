import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { debounce } from '../../../src/obsidian/functions/debounce.ts';

const DEBOUNCE_DELAY = 50;
const HALF_DEBOUNCE_DELAY = 25;
const WAIT_DELAY = 100;

beforeEach(() => {
  vi.useFakeTimers();
});

describe('debounce', () => {
  it('should delay execution', () => {
    let called = false;
    const fn = debounce(() => {
      called = true;
    }, DEBOUNCE_DELAY);
    fn();
    expect(called).toBe(false);
    vi.advanceTimersByTime(WAIT_DELAY);
    expect(called).toBe(true);
  });

  it('should reset timer on subsequent calls when resetTimer is true', () => {
    let count = 0;
    const fn = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      true
    );
    fn();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    fn();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    // Should not have fired yet because timer was reset
    expect(count).toBe(0);
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(count).toBe(1);
  });

  it('should not reset timer when resetTimer is false', () => {
    let count = 0;
    const fn = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      false
    );
    fn();
    fn();
    vi.advanceTimersByTime(WAIT_DELAY);
    // Should fire only once since resetTimer is false
    expect(count).toBe(1);
  });

  it('should support cancel', () => {
    let called = false;
    const fn = debounce(() => {
      called = true;
    }, DEBOUNCE_DELAY);
    fn();
    fn.cancel();
    vi.advanceTimersByTime(WAIT_DELAY);
    expect(called).toBe(false);
  });

  it('cancel should return the debouncer', () => {
    const fn = debounce(() => {
      // Noop
    }, DEBOUNCE_DELAY);
    fn();
    const result = fn.cancel();
    expect(result).toBe(fn);
  });

  it('cancel should be safe to call when no timer is pending', () => {
    const fn = debounce(() => {
      // Noop
    }, DEBOUNCE_DELAY);
    expect(() => {
      fn.cancel();
    }).not.toThrow();
  });

  it('should support run to execute immediately', () => {
    let value = '';
    const fn = debounce((v: string) => {
      value = v;
      return v;
    }, DEBOUNCE_DELAY);
    fn('hello');
    const result = fn.run();
    expect(value).toBe('hello');
    expect(result).toBe('hello');
  });

  it('run should return undefined when no args have been provided', () => {
    const fn = debounce(() => 'test', DEBOUNCE_DELAY);
    const result = fn.run();
    expect(result).toBeUndefined();
  });

  it('should return the debouncer when called', () => {
    const fn = debounce(() => {
      // Noop
    }, DEBOUNCE_DELAY);
    const result = fn();
    expect(result).toBe(fn);
  });
});

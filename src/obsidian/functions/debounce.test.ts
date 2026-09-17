import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../../internal/noop.ts';
import { debounce } from './debounce.ts';

const DEBOUNCE_DELAY = 50;
const HALF_DEBOUNCE_DELAY = 25;
const WAIT_DELAY = 100;

beforeEach(() => {
  vi.useFakeTimers();
});

describe('debounce', () => {
  it('should delay execution', () => {
    let isCalled = false;
    const $function = debounce(() => {
      isCalled = true;
    }, DEBOUNCE_DELAY);
    $function();
    expect(isCalled).toBe(false);
    vi.advanceTimersByTime(WAIT_DELAY);
    expect(isCalled).toBe(true);
  });

  it('should reset timer on subsequent calls when resetTimer is true', () => {
    let count = 0;
    const $function = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      true
    );
    $function();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    $function();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    // Should not have fired yet because timer was reset
    expect(count).toBe(0);
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(count).toBe(1);
  });

  it('should not reset timer when resetTimer is false', () => {
    let count = 0;
    const $function = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      false
    );
    $function();
    $function();
    vi.advanceTimersByTime(WAIT_DELAY);
    // Should fire only once since resetTimer is false
    expect(count).toBe(1);
  });

  it('should support cancel', () => {
    let isCalled = false;
    const $function = debounce(() => {
      isCalled = true;
    }, DEBOUNCE_DELAY);
    $function();
    $function.cancel();
    vi.advanceTimersByTime(WAIT_DELAY);
    expect(isCalled).toBe(false);
  });

  it('cancel should return the debouncer', () => {
    const $function = debounce(() => {
      noop();
    }, DEBOUNCE_DELAY);
    $function();
    const result = $function.cancel();
    expect(result).toBe($function);
  });

  it('cancel should be safe to call when no timer is pending', () => {
    const $function = debounce(() => {
      noop();
    }, DEBOUNCE_DELAY);
    expect(() => {
      $function.cancel();
    }).not.toThrow();
  });

  it('should support run to execute immediately', () => {
    let value = '';
    const $function = debounce((v: string) => {
      value = v;
      return v;
    }, DEBOUNCE_DELAY);
    $function('hello');
    const result = $function.run();
    expect(value).toBe('hello');
    expect(result).toBe('hello');
  });

  it('should call the callback with the latest arguments and this', () => {
    const calls: [unknown, string][] = [];
    const $function = debounce(function recordCall(this: unknown, v: string) {
      calls.push([this, v]);
    }, DEBOUNCE_DELAY);
    const first = { name: 'first' };
    const second = { name: 'second' };
    $function.call(first, 'a');
    $function.call(second, 'b');
    vi.advanceTimersByTime(WAIT_DELAY);
    expect(calls).toEqual([[second, 'b']]);
  });

  it('should not reset timer by default', () => {
    let count = 0;
    const $function = debounce(() => {
      count++;
    }, DEBOUNCE_DELAY);
    $function();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    $function();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    expect(count).toBe(1);
  });

  it('should push the deadline back more than once when resetTimer is true', () => {
    let count = 0;
    const $function = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      true
    );
    $function();
    vi.advanceTimersByTime(HALF_DEBOUNCE_DELAY);
    $function();
    vi.advanceTimersByTime(DEBOUNCE_DELAY - 1);
    $function();
    vi.advanceTimersByTime(DEBOUNCE_DELAY - 1);
    expect(count).toBe(0);
    vi.advanceTimersByTime(1);
    expect(count).toBe(1);
  });

  it('should fire at the original deadline when the reset lands in the same millisecond', () => {
    let count = 0;
    const $function = debounce(
      () => {
        count++;
      },
      DEBOUNCE_DELAY,
      true
    );
    $function();
    $function();
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(count).toBe(1);
  });

  it('run should not call the callback when no call is pending', () => {
    let count = 0;
    const $function = debounce(() => {
      count++;
      return count;
    }, DEBOUNCE_DELAY);
    $function();
    vi.advanceTimersByTime(WAIT_DELAY);
    expect($function.run()).toBeUndefined();
    $function();
    $function.cancel();
    expect($function.run()).toBeUndefined();
    expect(count).toBe(1);
  });

  it('should schedule with a zero timeout by default', () => {
    let isCalled = false;
    const $function = debounce(() => {
      isCalled = true;
    });
    $function();
    vi.advanceTimersByTime(0);
    expect(isCalled).toBe(true);
  });

  it('run should return undefined when no args have been provided', () => {
    const $function = debounce(() => 'test', DEBOUNCE_DELAY);
    const result = $function.run();
    expect(result).toBeUndefined();
  });

  it('should return the debouncer when called', () => {
    const $function = debounce(() => {
      noop();
    }, DEBOUNCE_DELAY);
    const result = $function();
    expect(result).toBe($function);
  });
});

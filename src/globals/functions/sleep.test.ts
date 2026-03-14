import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { sleep } from './sleep.ts';

const DELAY_MS = 100;

describe('sleep', () => {
  it('should resolve after the specified delay', async () => {
    vi.useFakeTimers();
    const promise = sleep(DELAY_MS);
    vi.advanceTimersByTime(DELAY_MS);
    await promise;
    expect(true).toBe(true);
    vi.useRealTimers();
  });
});

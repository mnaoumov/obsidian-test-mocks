import {
  describe,
  expect,
  it
} from 'vitest';

import { moment } from './moment.ts';

describe('moment', () => {
  it('should be a function', () => {
    expect(typeof moment).toBe('function');
  });
});

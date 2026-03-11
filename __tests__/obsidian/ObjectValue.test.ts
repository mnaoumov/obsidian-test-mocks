import {
  describe,
  expect,
  it
} from 'vitest';

import { ObjectValue } from '../../src/obsidian/ObjectValue.ts';

describe('ObjectValue', () => {
  it('should always be truthy', () => {
    const val = new ObjectValue({});
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new ObjectValue({});
    expect(String(val)).toBe('');
  });
});

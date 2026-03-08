import {
  describe,
  expect,
  it
} from 'vitest';

import { FileValue } from '../../src/obsidian/FileValue.ts';

describe('FileValue', () => {
  it('should always be truthy', () => {
    const val = new FileValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new FileValue();
    expect(String(val)).toBe('');
  });
});

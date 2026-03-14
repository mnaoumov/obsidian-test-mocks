import {
  describe,
  expect,
  it
} from 'vitest';

import { requireApiVersion } from './requireApiVersion.ts';

describe('requireApiVersion', () => {
  it('should always return true', () => {
    expect(requireApiVersion('1.0.0')).toBe(true);
  });
});

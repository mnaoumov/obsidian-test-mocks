import {
  describe,
  expect,
  it
} from 'vitest';

import { apiVersion } from './apiVersion.ts';

describe('apiVersion', () => {
  it('should be a valid version string', () => {
    expect(apiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

import {
  describe,
  expect,
  it
} from 'vitest';

import { Platform } from './Platform.ts';

describe('Platform', () => {
  it('should have isDesktop set to true', () => {
    expect(Platform.isDesktop).toBe(true);
  });

  it('should have isMobile set to false', () => {
    expect(Platform.isMobile).toBe(false);
  });

  it('should have resourcePathPrefix as a string', () => {
    expect(typeof Platform.resourcePathPrefix).toBe('string');
  });
});

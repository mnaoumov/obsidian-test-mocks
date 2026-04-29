import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../obsidian/App.ts';

describe('vitest-setup', () => {
  it('should set globalThis.app via setup()', () => {
    expect((globalThis as Record<string, unknown>)['app']).toBeDefined();
    expect((globalThis as Record<string, unknown>)['app']).toBeInstanceOf(App);
  });

  it('should apply prototype extensions via setup()', () => {
    const el = document.createElement('div');
    expect(typeof el.addClass).toBe('function');
  });
});

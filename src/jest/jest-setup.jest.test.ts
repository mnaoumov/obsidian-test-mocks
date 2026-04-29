/**
 * @jest-environment jsdom
 */

import {
  describe,
  expect,
  it
} from '@jest/globals';
import { App } from 'obsidian';

describe('jest-setup', () => {
  it('should alias obsidian module to mocks via moduleNameMapper', () => {
    expect(App).toBeDefined();
  });

  it('should set globalThis.app via setup()', () => {
    expect((globalThis as Record<string, unknown>)['app']).toBeDefined();
  });

  it('should apply prototype extensions via setup()', () => {
    const el = document.createElement('div');
    expect(typeof el.addClass).toBe('function');
  });
});

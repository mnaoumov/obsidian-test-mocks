import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../obsidian/App.ts';
import {
  postSetup,
  postTeardown
} from './post-setup.ts';

describe('post-setup', () => {
  describe('postSetup()', () => {
    it('should set globalThis.app to a configured App instance', () => {
      delete (globalThis as Record<string, unknown>)['app'];

      postSetup();

      expect((globalThis as Record<string, unknown>)['app']).toBeInstanceOf(App);
    });
  });

  describe('postTeardown()', () => {
    it('should delete globalThis.app', () => {
      (globalThis as Record<string, unknown>)['app'] = App.createConfigured__();

      postTeardown();

      expect((globalThis as Record<string, unknown>)['app']).toBeUndefined();
    });
  });
});

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from '../obsidian/App.ts';
import { Component } from '../obsidian/Component.ts';
import {
  setup,
  teardown
} from './setup.ts';

describe('obsidian-typings-setup', () => {
  afterEach(() => {
    teardown();
  });

  it('should bridge all properties after setup', () => {
    setup();

    const app = App.createConfigured__();
    const component = Component.create__();

    const componentRecord = ensureGenericObject(component);
    expect(componentRecord['_loaded']).toBe(false);
    expect(componentRecord['_children']).toEqual([]);

    const vaultRecord = ensureGenericObject(app.vault);
    const fn = vaultRecord['getAvailablePath'] as (path: string, ext: string) => string;
    expect(fn('note', 'md')).toBe('note.md');
  });

  it('should remove all bridges after teardown', () => {
    setup();
    teardown();

    const component = Component.create__();
    expect('_loaded' in component).toBe(false);
    expect('_children' in component).toBe(false);
  });

  it('should be idempotent', () => {
    setup();
    setup();

    const component = Component.create__();
    expect(ensureGenericObject(component)['_loaded']).toBe(false);
  });
});

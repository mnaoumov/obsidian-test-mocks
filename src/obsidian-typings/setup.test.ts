/* eslint-disable @typescript-eslint/no-deprecated, import-x/no-deprecated -- These tests exist precisely to pin the deprecated entry point's behavior: that it is harmless, and that the members it used to install are present without it. */
import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../obsidian/App.ts';
import { Component } from '../obsidian/Component.ts';
import {
  setup,
  teardown
} from './setup.ts';

describe('obsidian-typings-setup', () => {
  it('should expose the obsidian-typings names without any setup', () => {
    const app = App.createConfigured__();
    const component = Component.create__();

    expect(component._loaded).toBe(false);
    expect(component._children).toEqual([]);
    expect(app.vault.getAvailablePath('note', 'md')).toBe('note.md');
  });

  it('should leave the mocks untouched when setup and teardown run', () => {
    setup();
    teardown();
    setup();

    const component = Component.create__();

    // Teardown used to delete the bridged properties, so calling it mid-suite could break a later test.
    // No ordering of these calls can remove the members now that they belong to the mock itself.
    expect(component._loaded).toBe(false);
    expect(component._children).toEqual([]);
  });
});

/* eslint-enable @typescript-eslint/no-deprecated, import-x/no-deprecated -- Restores the rules disabled for this whole file. */

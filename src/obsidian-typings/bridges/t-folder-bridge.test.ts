import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { TFolder } from '../../obsidian/TFolder.ts';
import {
  bridgeTFolder,
  unbridgeTFolder
} from './t-folder-bridge.ts';

type GetParentPrefixFunction = (this: TFolder) => string;

describe('t-folder-bridge', () => {
  afterEach(() => {
    unbridgeTFolder();
  });

  describe('getParentPrefix', () => {
    it('should return an empty string for the root', () => {
      bridgeTFolder();
      const app = App.createConfigured__();
      const root = app.vault.getRoot();
      const $function = ensureGenericObject(root)['getParentPrefix'] as GetParentPrefixFunction;
      expect($function.call(root)).toBe('');
    });

    it('should append a slash for a non-root folder', () => {
      bridgeTFolder();
      const app = App.createConfigured__();
      const folder = app.vault.createFolderSync__('Docs/api');
      const $function = ensureGenericObject(folder)['getParentPrefix'] as GetParentPrefixFunction;
      expect($function.call(folder)).toBe('Docs/api/');
    });
  });

  it('should be idempotent', () => {
    bridgeTFolder();
    bridgeTFolder();
    const app = App.createConfigured__();
    const folder = app.vault.createFolderSync__('Docs');
    const $function = ensureGenericObject(folder)['getParentPrefix'] as GetParentPrefixFunction;
    expect($function.call(folder)).toBe('Docs/');
  });

  it('should remove the bridge on unbridge', () => {
    bridgeTFolder();
    unbridgeTFolder();
    const app = App.createConfigured__();
    expect('getParentPrefix' in app.vault.getRoot()).toBe(false);
  });
});

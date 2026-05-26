import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { Vault } from '../../obsidian/Vault.ts';
import {
  bridgeVault,
  unbridgeVault
} from './vault-bridge.ts';

type ExistsFn = (this: Vault, path: string, isCaseSensitive?: boolean) => Promise<boolean>;
type GetAbstractFileByPathInsensitiveFn = (this: Vault, path: string) => unknown;
type GetAvailablePathFn = (this: Vault, path: string, ext: string) => string;

describe('vault-bridge', () => {
  afterEach(() => {
    unbridgeVault();
  });

  describe('exists', () => {
    it('should resolve to true for existing file (case-insensitive)', async () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createSync__('Notes/File.md', 'content');
      const exists = ensureGenericObject(app.vault)['exists'] as ExistsFn;
      await expect(exists.call(app.vault, 'notes/file.md')).resolves.toBe(true);
    });

    it('should resolve to false for non-existing file', async () => {
      bridgeVault();
      const app = App.createConfigured__();
      const exists = ensureGenericObject(app.vault)['exists'] as ExistsFn;
      await expect(exists.call(app.vault, 'missing.md')).resolves.toBe(false);
    });

    it('should use case-sensitive check when isCaseSensitive is true', async () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createSync__('Notes/File.md', 'content');
      const exists = ensureGenericObject(app.vault)['exists'] as ExistsFn;
      await expect(exists.call(app.vault, 'notes/file.md', true)).resolves.toBe(false);
      await expect(exists.call(app.vault, 'Notes/File.md', true)).resolves.toBe(true);
    });
  });

  describe('getAbstractFileByPathInsensitive', () => {
    it('should find file case-insensitively', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const file = app.vault.createSync__('Notes/File.md', 'content');
      const fn = ensureGenericObject(app.vault)['getAbstractFileByPathInsensitive'] as GetAbstractFileByPathInsensitiveFn;
      expect(fn.call(app.vault, 'notes/file.md')).toBe(file);
    });

    it('should return null for non-existing file', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getAbstractFileByPathInsensitive'] as GetAbstractFileByPathInsensitiveFn;
      expect(fn.call(app.vault, 'missing.md')).toBeNull();
    });
  });

  describe('getAvailablePath', () => {
    it('should return path with extension', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
      expect(fn.call(app.vault, 'note', 'md')).toBe('note.md');
    });

    it('should return base path when extension is empty', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
      expect(fn.call(app.vault, 'note', '')).toBe('note');
    });
  });

  it('should be idempotent', () => {
    bridgeVault();
    bridgeVault();
    const app = App.createConfigured__();
    const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
    expect(fn.call(app.vault, 'note', 'md')).toBe('note.md');
  });

  it('should remove bridges on unbridge', () => {
    bridgeVault();
    unbridgeVault();
    const app = App.createConfigured__();
    expect('exists' in app.vault).toBe(false);
    expect('getAbstractFileByPathInsensitive' in app.vault).toBe(false);
    expect('getAvailablePath' in app.vault).toBe(false);
  });
});

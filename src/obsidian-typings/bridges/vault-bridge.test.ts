import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import type { TFile } from '../../obsidian/TFile.ts';

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
type GetAvailablePathForAttachmentsFn = (this: Vault, fileName: string, ext: string, file: null | TFile) => Promise<string>;
type GetConfigFn = (this: Vault, key: string) => unknown;
type SetConfigFn = (this: Vault, key: string, value: unknown) => void;

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

    it('should append " N" when the path is taken', () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', 'content');
      const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
      expect(fn.call(app.vault, 'note', 'md')).toBe('note 1.md');
    });

    it('should increment until a free path is found', () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createSync__('note.md', 'content');
      app.vault.createSync__('note 1.md', 'content');
      const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
      expect(fn.call(app.vault, 'note', 'md')).toBe('note 2.md');
    });

    it('should de-duplicate when extension is empty', () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createSync__('note', 'content');
      const fn = ensureGenericObject(app.vault)['getAvailablePath'] as GetAvailablePathFn;
      expect(fn.call(app.vault, 'note', '')).toBe('note 1');
    });
  });

  describe('getAvailablePathForAttachments', () => {
    it('should resolve the attachment path for the configured folder', async () => {
      bridgeVault();
      const app = App.createConfigured__();
      app.vault.createFolderSync__('Docs/api');
      const note = app.vault.createSync__('Docs/api/get.md', 'content');
      app.vault.setConfig__('attachmentFolderPath', './assets');
      const fn = ensureGenericObject(app.vault)['getAvailablePathForAttachments'] as GetAvailablePathForAttachmentsFn;
      await expect(fn.call(app.vault, 'img', 'png', note)).resolves.toBe('Docs/api/assets/img.png');
    });

    it('should expose no extended member by default', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getAvailablePathForAttachments'] as GetAvailablePathForAttachmentsFn;
      expect(ensureGenericObject(fn)['extended']).toBeUndefined();
    });
  });

  describe('getConfig / setConfig', () => {
    it('should read the modeled attachmentFolderPath default', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getConfig'] as GetConfigFn;
      expect(fn.call(app.vault, 'attachmentFolderPath')).toBe('/');
    });

    it('should return undefined for a key that was never set', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const fn = ensureGenericObject(app.vault)['getConfig'] as GetConfigFn;
      expect(fn.call(app.vault, 'newLinkFormat')).toBeUndefined();
    });

    it('should round-trip a value written by setConfig', () => {
      bridgeVault();
      const app = App.createConfigured__();
      const setFn = ensureGenericObject(app.vault)['setConfig'] as SetConfigFn;
      const getFn = ensureGenericObject(app.vault)['getConfig'] as GetConfigFn;
      setFn.call(app.vault, 'attachmentFolderPath', 'Files');
      expect(getFn.call(app.vault, 'attachmentFolderPath')).toBe('Files');
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
    expect('getAvailablePathForAttachments' in app.vault).toBe(false);
    expect('getConfig' in app.vault).toBe(false);
    expect('setConfig' in app.vault).toBe(false);
  });
});

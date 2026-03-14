import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { SecretStorage } from '../../src/obsidian/SecretStorage.ts';

describe('SecretStorage', () => {
  it('should create an instance via create__', async () => {
    const app = await App.createConfigured__();
    const storage = SecretStorage.create__(app);
    expect(storage).toBeInstanceOf(SecretStorage);
  });

  describe('setSecret / getSecret', () => {
    it('should store and retrieve a secret', async () => {
      const app = await App.createConfigured__();
      const storage = SecretStorage.create__(app);
      storage.setSecret('api-key', 'abc123');
      expect(storage.getSecret('api-key')).toBe('abc123');
    });

    it('should return null for unknown id', async () => {
      const app = await App.createConfigured__();
      const storage = SecretStorage.create__(app);
      expect(storage.getSecret('unknown')).toBeNull();
    });
  });

  describe('listSecrets', () => {
    it('should return empty array initially', async () => {
      const app = await App.createConfigured__();
      const storage = SecretStorage.create__(app);
      expect(storage.listSecrets()).toEqual([]);
    });

    it('should return all stored secret ids', async () => {
      const app = await App.createConfigured__();
      const storage = SecretStorage.create__(app);
      storage.setSecret('key1', 'val1');
      storage.setSecret('key2', 'val2');
      expect(storage.listSecrets()).toEqual(['key1', 'key2']);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const storage = SecretStorage.create__(app);
      const original: SecretStorageOriginal = storage.asOriginalType__();
      expect(original).toBe(storage);
    });
  });
});

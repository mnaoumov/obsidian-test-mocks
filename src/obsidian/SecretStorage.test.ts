import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { SecretStorage } from './SecretStorage.ts';

describe('SecretStorage', () => {
  it('should create an instance via create__', () => {
    const app = App.createConfigured__();
    const storage = SecretStorage.create__(app);
    expect(storage).toBeInstanceOf(SecretStorage);
  });

  describe('setSecret / getSecret', () => {
    it('should store and retrieve a secret', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      storage.setSecret('api-key', 'abc123');
      expect(storage.getSecret('api-key')).toBe('abc123');
    });

    it('should return null for unknown id', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      expect(storage.getSecret('unknown')).toBeNull();
    });
  });

  describe('listSecrets', () => {
    it('should return empty array initially', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      expect(storage.listSecrets()).toEqual([]);
    });

    it('should return all stored secret ids', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      storage.setSecret('key1', 'val1');
      storage.setSecret('key2', 'val2');
      expect(storage.listSecrets()).toEqual(['key1', 'key2']);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      const original: SecretStorageOriginal = storage.asOriginalType__();
      expect(original).toBe(storage);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create__(app);
      const mock = SecretStorage.fromOriginalType__(storage.asOriginalType__());
      expect(mock).toBe(storage);
    });
  });
});

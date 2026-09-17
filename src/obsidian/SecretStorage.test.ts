import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { SecretStorage } from './SecretStorage.ts';

describe('SecretStorage', () => {
  it('should create an instance via create2__', () => {
    const app = App.createConfigured__();
    const storage = SecretStorage.create2__(app);
    expect(storage).toBeInstanceOf(SecretStorage);
  });

  describe('setSecret / getSecret', () => {
    it('should store and retrieve a secret', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      storage.setSecret('api-key', 'abc123');
      expect(storage.getSecret('api-key')).toBe('abc123');
    });

    it('should trigger changed when a secret is set', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      const callback = vi.fn();
      storage.on('changed', callback);
      storage.setSecret('api-key', 'abc123');
      expect(callback).toHaveBeenCalledOnce();
    });

    it.each(['API-KEY', 'api_key', '', 'a'.repeat(65)])('should reject the invalid id %j', (id) => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      expect(() => {
        storage.setSecret(id, 'abc123');
      }).toThrow('Secret ID is invalid. Use only lowercase letters, numbers and dashes. 64 characters max.');
      expect(storage.listSecrets()).toEqual([]);
    });

    it('should accept a 64-character id', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      const id = 'a'.repeat(64);
      storage.setSecret(id, 'abc123');
      expect(storage.getSecret(id)).toBe('abc123');
    });

    it('should return null for unknown id', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      expect(storage.getSecret('unknown')).toBeNull();
    });
  });

  describe('listSecrets', () => {
    it('should return empty array initially', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      expect(storage.listSecrets()).toEqual([]);
    });

    it('should return all stored secret ids', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      storage.setSecret('key1', 'val1');
      storage.setSecret('key2', 'val2');
      expect(storage.listSecrets()).toEqual(['key1', 'key2']);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      const original: SecretStorageOriginal = storage.asOriginalType2__();
      expect(original).toBe(storage);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const storage = SecretStorage.create2__(app);
      const mock = SecretStorage.fromOriginalType2__(storage.asOriginalType2__());
      expect(mock).toBe(storage);
    });
  });
});

/**
 * @file
 *
 * Mock of Obsidian's `SecretStorage`, the app's store of named secrets.
 */

import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';

const MAX_SECRET_ID_LENGTH = 64;
const SECRET_ID_REG_EXP = /^[a-z0-9-]+$/;

/**
 * Mock of Obsidian's `SecretStorage`, which stores secret values by id.
 *
 * Secrets are kept in an in-memory map for the lifetime of the instance, so nothing is encrypted or persisted. As in
 * Obsidian, {@link SecretStorage.setSecret} validates the id and triggers `changed`.
 */
export class SecretStorage extends Events {
  private readonly store = new Map<string, string>();

  /**
   * Creates an empty secret storage. Use {@link SecretStorage.create2__} from outside the class.
   *
   * @param app - The app instance.
   */
  protected constructor(app: App) {
    super();
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a secret storage, spyable via `vi.spyOn(SecretStorage, 'create2__')`. It is the
   * subclass variant of `Events`' factory.
   *
   * @param app - The app instance.
   * @returns The new secret storage.
   */
  public static create2__(app: App): SecretStorage {
    return new SecretStorage(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SecretStorage` as this mock.
   *
   * @param value - The value typed as the original `SecretStorage`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: SecretStorageOriginal): SecretStorage {
    return strictProxy(value, SecretStorage);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SecretStorage` type.
   *
   * @returns The same object, typed as the original `SecretStorage`.
   */
  public asOriginalType2__(): SecretStorageOriginal {
    return strictProxy<SecretStorageOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SecretStorage.prototype, 'constructor2__')`.
   *
   * @param _app - The app the storage was created with.
   */
  public constructor2__(_app: App): void {
    noop();
  }

  /**
   * Gets a secret from the storage.
   *
   * @param id - The secret id.
   * @returns The secret value, or `null` if none is stored under `id`.
   */
  public getSecret(id: string): null | string {
    return this.store.get(id) ?? null;
  }

  /**
   * Lists the ids of all stored secrets.
   *
   * @returns The secret ids, in insertion order.
   */
  public listSecrets(): string[] {
    return [...this.store.keys()];
  }

  /**
   * Stores a secret, replacing any existing value under the same id, and triggers `changed`.
   *
   * @param id - The secret id: lowercase letters, digits and dashes, at most 64 characters.
   * @param secret - The secret value to store.
   * @throws Error with Obsidian's message when the id is invalid.
   */
  public setSecret(id: string, secret: string): void {
    if (!SECRET_ID_REG_EXP.test(id) || id.length > MAX_SECRET_ID_LENGTH) {
      throw new Error('Secret ID is invalid. Use only lowercase letters, numbers and dashes. 64 characters max.');
    }
    this.store.set(id, secret);
    this.trigger('changed');
  }
}

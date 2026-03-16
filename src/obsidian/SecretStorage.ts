import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import type { App } from './App.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class SecretStorage {
  private readonly store = new Map<string, string>();

  protected constructor(_app: App) {
    const self = createMockOfUnsafe(this);
    self.constructor__(_app);
    return self;
  }

  public static create__(app: App): SecretStorage {
    return new SecretStorage(app);
  }

  public static fromOriginalType__(value: SecretStorageOriginal): SecretStorage {
    return createMockOfUnsafe<SecretStorage>(value);
  }

  public asOriginalType__(): SecretStorageOriginal {
    return createMockOfUnsafe<SecretStorageOriginal>(this);
  }

  public constructor__(_app: App): void {
    noop();
  }

  public getSecret(id: string): null | string {
    return this.store.get(id) ?? null;
  }

  public listSecrets(): string[] {
    return [...this.store.keys()];
  }

  public setSecret(id: string, secret: string): void {
    this.store.set(id, secret);
  }
}

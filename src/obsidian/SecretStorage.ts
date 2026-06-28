import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';

export class SecretStorage extends Events {
  private readonly store = new Map<string, string>();

  protected constructor(app: App) {
    super();
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  public static create2__(app: App): SecretStorage {
    return new SecretStorage(app);
  }

  public static fromOriginalType2__(value: SecretStorageOriginal): SecretStorage {
    return strictProxy(value, SecretStorage);
  }

  public asOriginalType2__(): SecretStorageOriginal {
    return strictProxy<SecretStorageOriginal>(this);
  }

  public constructor2__(_app: App): void {
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

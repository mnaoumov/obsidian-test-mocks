import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class SecretStorage {
  private readonly store = new Map<string, string>();

  protected constructor(_app: App) {
    noop();
  }

  public static create__(app: App): SecretStorage {
    return strictMock(new SecretStorage(app));
  }

  public asOriginalType__(): SecretStorageOriginal {
    return castTo<SecretStorageOriginal>(this);
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

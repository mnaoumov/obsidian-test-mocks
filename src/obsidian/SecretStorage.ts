import type { SecretStorage as SecretStorageOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';

export class SecretStorage {
  private readonly store = new Map<string, string>();

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

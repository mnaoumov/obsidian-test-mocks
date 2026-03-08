import { castTo } from '../internal/Cast.ts';
import type { SecretStorage as RealSecretStorage } from 'obsidian';

export class SecretStorage {
  private store = new Map<string, string>();

  public getSecret(id: string): string | null {
    return this.store.get(id) ?? null;
  }

  public listSecrets(): string[] {
    return [...this.store.keys()];
  }

  public setSecret(id: string, secret: string): void {
    this.store.set(id, secret);
  }

  public asReal__(): RealSecretStorage {
    return castTo<RealSecretStorage>(this);
  }
}

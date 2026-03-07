import { noopAsync } from '../internal/Noop.ts';

export class SecretStorage {
  private store = new Map<string, string>();

  public async delete(key: string): Promise<void> {
    this.store.delete(key);
    await noopAsync();
  }

  public async get(key: string): Promise<string | undefined> {
    return this.store.get(key);
  }

  public async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    await noopAsync();
  }
}

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { strictMock } from '../internal/StrictMock.ts';

export abstract class TAbstractFile {
  public deleted = false;
  public name: string;
  public parent: null | TFolder = null;
  public path: string;
  public vault: Vault;

  protected constructor(vault: Vault, path: string) {
    this.vault = vault;
    this.path = path;
    const parts = path.split('/');
    this.name = parts[parts.length - 1] ?? '';
    const mock = strictMock(this);
    TAbstractFile.constructor__(mock, vault, path);
    return mock;
  }

  public static constructor__(_instance: TAbstractFile, _vault: Vault, _path: string): void {
    // Spy hook.
  }
}

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { strictMock } from '../internal/StrictMock.ts';

export abstract class TAbstractFile {
  public deleted = true;
  public name: string;
  public parent: null | TFolder = null;
  public path: string;
  public vault: Vault;

  protected constructor(vault: Vault, path: string) {
    this.vault = vault;
    this.path = path;
    const parts = path.split('/');
    this.name = parts[parts.length - 1] ?? '';
    TAbstractFile.__constructor(this, vault, path);
    return strictMock(this);
  }

  public static __constructor(_instance: TAbstractFile, _vault: Vault, _path: string): void {
    // Spy hook.
  }
}

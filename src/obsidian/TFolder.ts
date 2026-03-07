import type { Vault } from './Vault.ts';

import { TAbstractFile } from './TAbstractFile.ts';

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[] = [];

  public static __create(vault: Vault, path: string): TFolder {
    return new TFolder(vault, path);
  }

  public static override __constructor(_instance: TFolder, _vault: Vault, _path: string): void {
    // Spy hook.
  }

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    TFolder.__constructor(this, vault, path);
  }

  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

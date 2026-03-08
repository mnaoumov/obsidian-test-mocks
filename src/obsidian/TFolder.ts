import type { TFolder as TFolderOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[] = [];

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const mock = strictMock(this);
    TFolder.constructor__(mock, vault, path);
    return mock;
  }

  public static override constructor__(_instance: TFolder, _vault: Vault, _path: string): void {
    // Spy hook.
  }

  public static create__(vault: Vault, path: string): TFolder {
    return new TFolder(vault, path);
  }

  public override asOriginalType__(): TFolderOriginal {
    return castTo<TFolderOriginal>(this);
  }

  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

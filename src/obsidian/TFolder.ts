import type { TFolder as TFolderOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[] = [];

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
  }

  public static create__(vault: Vault, path: string): TFolder {
    return strictMock(new TFolder(vault, path));
  }

  public override asOriginalType__(): TFolderOriginal {
    return castTo<TFolderOriginal>(this);
  }

  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

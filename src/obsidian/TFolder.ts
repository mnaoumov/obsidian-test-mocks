import type { TFolder as TFolderOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[] = [];

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const self = strictMock(this);
    self.constructor2__(vault, path);
    return self;
  }

  public static create__(vault: Vault, path: string): TFolder {
    return new TFolder(vault, path);
  }

  public static fromOriginalType2__(value: TFolderOriginal): TFolder {
    return castTo<TFolder>(value);
  }

  public asOriginalType2__(): TFolderOriginal {
    return castTo<TFolderOriginal>(this);
  }

  public constructor2__(_vault: Vault, _path: string): void {
    noop();
  }

  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

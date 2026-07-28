import type { TFolder as TFolderOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[] = [];

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const self = strictProxy(this);
    self.constructor2__(vault, path);
    return self;
  }

  public static create__(vault: Vault, path: string): TFolder {
    return new TFolder(vault, path);
  }

  public static fromOriginalType2__(value: TFolderOriginal): TFolder {
    return strictProxy(value, TFolder);
  }

  public asOriginalType2__(): TFolderOriginal {
    return strictProxy<TFolderOriginal>(this);
  }

  public constructor2__(_vault: Vault, _path: string): void {
    noop();
  }

  /**
   * The prefix every direct child's path carries: `''` for the root, `` `${path}/` `` otherwise.
   * Confirmed against a real Obsidian 1.13.4.
   *
   * @returns The parent prefix.
   */
  public getParentPrefix__(): string {
    return this.isRoot() ? '' : `${this.path}/`;
  }

  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

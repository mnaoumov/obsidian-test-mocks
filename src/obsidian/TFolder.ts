/**
 * @file
 *
 * Mock of Obsidian's `TFolder`, a folder in the vault.
 */

import type { TFolder as TFolderOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TAbstractFile } from './TAbstractFile.ts';

/**
 * Mock of Obsidian's `TFolder`: a vault folder holding its direct children.
 */
export class TFolder extends TAbstractFile {
  /**
   * The folder's direct children, files and folders alike.
   */
  public children: TAbstractFile[] = [];

  /**
   * Creates a folder with no children.
   *
   * @param vault - The vault the folder belongs to.
   * @param path - The folder's vault-relative path; `''` or `'/'` for the root.
   */
  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const self = strictProxy(this);
    self.constructor2__(vault, path);
    return self;
  }

  /**
   * Mock-only factory: creates a folder, spyable via `vi.spyOn(TFolder, 'create__')`. It does not add the folder to
   * the vault.
   *
   * @param vault - The vault the folder belongs to.
   * @param path - The folder's vault-relative path.
   * @returns The new folder.
   */
  public static create__(vault: Vault, path: string): TFolder {
    return new TFolder(vault, path);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TFolder` as this mock.
   *
   * @param value - The value typed as the original `TFolder`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: TFolderOriginal): TFolder {
    return strictProxy(value, TFolder);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TFolder` type.
   *
   * @returns The same object, typed as the original `TFolder`.
   */
  public asOriginalType2__(): TFolderOriginal {
    return strictProxy<TFolderOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TFolder.prototype, 'constructor2__')`.
   *
   * @param _vault - The vault the folder was created with.
   * @param _path - The path the folder was created with.
   */
  public constructor2__(_vault: Vault, _path: string): void {
    noop();
  }

  /**
   * The prefix every direct child's path carries: `''` for the root, `` `${path}/` `` otherwise.
   * Confirmed against a real Obsidian 1.13.4.
   *
   * @returns The parent prefix.
   */
  public getParentPrefix(): string {
    return this.isRoot() ? '' : `${this.path}/`;
  }

  /**
   * Checks whether this is the vault's root folder.
   *
   * @returns `true` when the path is `''` or `'/'`.
   */
  public isRoot(): boolean {
    return this.path === '' || this.path === '/';
  }
}

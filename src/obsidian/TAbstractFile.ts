/**
 * @file
 *
 * Mock of Obsidian's `TAbstractFile`, the common base of vault files and folders.
 */

import type { TAbstractFile as TAbstractFileOriginal } from 'obsidian';

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

/**
 * Mock of Obsidian's `TAbstractFile` base class: a vault entry identified by its path.
 */
export abstract class TAbstractFile {
  /**
   * Whether the entry has been deleted from the vault.
   */
  public deleted = false;

  /**
   * The entry's name: the last segment of its path, including any extension.
   */
  public name: string;

  /**
   * The folder containing the entry, or `null` for the root or an entry not yet attached.
   */
  public parent: null | TFolder = null;

  /**
   * The entry's vault-relative path.
   */
  public path: string;

  /**
   * The vault the entry belongs to.
   */
  public vault: Vault;

  /**
   * Creates an entry and derives its name from the path.
   *
   * @param vault - The vault the entry belongs to.
   * @param path - The entry's vault-relative path.
   */
  protected constructor(vault: Vault, path: string) {
    this.vault = vault;
    this.path = path;
    const parts = path.split('/');
    this.name = ensureNonNullable(parts.at(-1));
    const self = strictProxy(this);
    self.constructor__(vault, path);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TAbstractFile` as this mock.
   *
   * @param value - The value typed as the original `TAbstractFile`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: TAbstractFileOriginal): TAbstractFile {
    return strictProxy(value, TAbstractFile);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TAbstractFile` type.
   *
   * @returns The same object, typed as the original `TAbstractFile`.
   */
  public asOriginalType__(): TAbstractFileOriginal {
    return strictProxy<TAbstractFileOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TAbstractFile.prototype, 'constructor__')`.
   *
   * @param _vault - The vault the entry was created with.
   * @param _path - The path the entry was created with.
   */
  public constructor__(_vault: Vault, _path: string): void {
    noop();
  }
}

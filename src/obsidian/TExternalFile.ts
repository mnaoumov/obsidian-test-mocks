/**
 * @file
 *
 * Mock of Obsidian's `TExternalFile`, a file outside the vault that the vault API can still open.
 */

import type { TExternalFile as TExternalFileOriginal } from 'obsidian';

import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TFile } from './TFile.ts';

/**
 * The prefix Obsidian puts in front of an external file's real path to form its `path`.
 */
const EXTERNAL_FILE_PATH_PREFIX = 'file:';

/**
 * Mock of Obsidian's `TExternalFile`: a `TFile` whose `path` is its filesystem path behind a `file:` prefix, as
 * Obsidian 1.14.4's `setPath` forms it. The mock does not watch the file and keeps no list of its users.
 */
export class TExternalFile extends TFile {
  /**
   * Creates an external file for a filesystem path.
   *
   * @param vault - The vault the file is opened through.
   * @param realPath - The file's physical path in the filesystem.
   */
  protected constructor(vault: Vault, realPath: string) {
    super(vault, EXTERNAL_FILE_PATH_PREFIX + realPath);
    const self = strictProxy(this);
    self.constructor3__(vault, realPath);
    return self;
  }

  /**
   * Mock-only factory: creates an external file, spyable via `vi.spyOn(TExternalFile, 'create2__')`. Obsidian creates
   * these itself when a file outside the vault is opened, so a test builds one here instead. It does not add the
   * file to the vault.
   *
   * @param vault - The vault the file is opened through.
   * @param realPath - The file's physical path in the filesystem.
   * @returns The new external file.
   */
  public static create2__(vault: Vault, realPath: string): TExternalFile {
    return new TExternalFile(vault, realPath);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TExternalFile` as this mock.
   *
   * @param value - The value typed as the original `TExternalFile`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: TExternalFileOriginal): TExternalFile {
    return strictProxy(value, TExternalFile);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TExternalFile` type.
   *
   * @returns The same object, typed as the original `TExternalFile`.
   */
  public asOriginalType3__(): TExternalFileOriginal {
    return strictProxy<TExternalFileOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TExternalFile.prototype, 'constructor3__')`.
   *
   * @param _vault - The vault the file was created with.
   * @param _realPath - The filesystem path the file was created with.
   */
  public constructor3__(_vault: Vault, _realPath: string): void {
    noop();
  }

  /**
   * Gets the file's physical path in the filesystem.
   *
   * @returns The `path` with its `file:` prefix removed, as Obsidian's own `path.substring(5)` does.
   */
  public getRealPath(): string {
    return this.path.slice(EXTERNAL_FILE_PATH_PREFIX.length);
  }
}

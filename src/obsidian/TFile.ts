/**
 * @file
 *
 * Mock of Obsidian's `TFile`, a file in the vault.
 */

import type {
  FileStats as FileStatsOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TAbstractFile } from './TAbstractFile.ts';

/**
 * Mock of Obsidian's `TFile`: a vault file whose basename and extension are derived from its name.
 */
export class TFile extends TAbstractFile {
  /**
   * The file name without its extension.
   */
  public basename: string;

  /**
   * The file extension without the leading dot; empty when the name has no dot.
   */
  public extension: string;

  /**
   * The file's creation time, modification time and size; all `0` until the vault sets them.
   */
  public stat: FileStatsOriginal = { ctime: 0, mtime: 0, size: 0 };

  /**
   * Creates a file and splits its name into basename and extension at the last dot.
   *
   * @param vault - The vault the file belongs to.
   * @param path - The file's vault-relative path.
   */
  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const dotIndex = this.name.lastIndexOf('.');
    this.extension = dotIndex === -1 ? '' : this.name.slice(dotIndex + 1);
    this.basename = dotIndex === -1 ? this.name : this.name.slice(0, dotIndex);
    const self = strictProxy(this);
    self.constructor2__(vault, path);
    return self;
  }

  /**
   * Mock-only factory: creates a file, spyable via `vi.spyOn(TFile, 'create__')`. It does not add the file to the
   * vault.
   *
   * @param vault - The vault the file belongs to.
   * @param path - The file's vault-relative path.
   * @returns The new file.
   */
  public static create__(vault: Vault, path: string): TFile {
    return new TFile(vault, path);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TFile` as this mock.
   *
   * @param value - The value typed as the original `TFile`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: TFileOriginal): TFile {
    return strictProxy(value, TFile);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TFile` type.
   *
   * @returns The same object, typed as the original `TFile`.
   */
  public asOriginalType2__(): TFileOriginal {
    return strictProxy<TFileOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TFile.prototype, 'constructor2__')`.
   *
   * @param _vault - The vault the file was created with.
   * @param _path - The path the file was created with.
   */
  public constructor2__(_vault: Vault, _path: string): void {
    noop();
  }

  /**
   * Gets the name Obsidian shows for the file.
   *
   * @returns The basename for a markdown file, whose extension the app hides, and the full name for any
   * other file.
   */
  public getShortName(): string {
    return this.extension === 'md' ? this.basename : this.name;
  }
}

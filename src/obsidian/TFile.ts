import type {
  FileStats,
  TFile as TFileOriginal
} from 'obsidian';

import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFile extends TAbstractFile {
  public basename: string;
  public extension: string;
  public stat: FileStats = { ctime: 0, mtime: 0, size: 0 };

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const dotIndex = this.name.lastIndexOf('.');
    this.extension = dotIndex >= 0 ? this.name.slice(dotIndex + 1) : '';
    this.basename = dotIndex >= 0 ? this.name.slice(0, dotIndex) : this.name;
    const mock = strictMock(this);
    TFile.constructor__(mock, vault, path);
    return mock;
  }

  public static override constructor__(_instance: TFile, _vault: Vault, _path: string): void {
    // Spy hook.
  }

  public static create__(vault: Vault, path: string): TFile {
    return new TFile(vault, path);
  }

  public override asOriginalType__(): TFileOriginal {
    return castTo<TFileOriginal>(this);
  }
}

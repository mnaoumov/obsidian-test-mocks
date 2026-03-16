import type {
  FileStats as FileStatsOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { TAbstractFile } from './TAbstractFile.ts';

export class TFile extends TAbstractFile {
  public basename: string;
  public extension: string;
  public stat: FileStatsOriginal = { ctime: 0, mtime: 0, size: 0 };

  protected constructor(vault: Vault, path: string) {
    super(vault, path);
    const dotIndex = this.name.lastIndexOf('.');
    this.extension = dotIndex >= 0 ? this.name.slice(dotIndex + 1) : '';
    this.basename = dotIndex >= 0 ? this.name.slice(0, dotIndex) : this.name;
    const self = strictProxyForce(this);
    self.constructor2__(vault, path);
    return self;
  }

  public static create__(vault: Vault, path: string): TFile {
    return new TFile(vault, path);
  }

  public static fromOriginalType2__(value: TFileOriginal): TFile {
    return strictProxyForce(value, TFile);
  }

  public asOriginalType2__(): TFileOriginal {
    return strictProxyForce<TFileOriginal>(this);
  }

  public constructor2__(_vault: Vault, _path: string): void {
    noop();
  }
}

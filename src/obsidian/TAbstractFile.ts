import type { TAbstractFile as TAbstractFileOriginal } from 'obsidian';

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';

export abstract class TAbstractFile {
  public deleted = false;
  public name: string;
  public parent: null | TFolder = null;
  public path: string;
  public vault: Vault;

  protected constructor(vault: Vault, path: string) {
    this.vault = vault;
    this.path = path;
    const parts = path.split('/');
    this.name = parts[parts.length - 1] ?? '';
  }

  public asOriginalType__(): TAbstractFileOriginal {
    return castTo<TAbstractFileOriginal>(this);
  }
}

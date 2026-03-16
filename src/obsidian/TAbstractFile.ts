import type { TAbstractFile as TAbstractFileOriginal } from 'obsidian';

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

export abstract class TAbstractFile {
  public deleted__ = false;
  public name: string;
  public parent: null | TFolder = null;
  public path: string;
  public vault: Vault;

  protected constructor(vault: Vault, path: string) {
    this.vault = vault;
    this.path = path;
    const parts = path.split('/');
    this.name = ensureNonNullable(parts[parts.length - 1]);
    const self = strictProxyForce(this);
    self.constructor__(vault, path);
    return self;
  }

  public static fromOriginalType__(value: TAbstractFileOriginal): TAbstractFile {
    return strictProxyForce(value, TAbstractFile);
  }

  public asOriginalType__(): TAbstractFileOriginal {
    return strictProxyForce<TAbstractFileOriginal>(this);
  }

  public constructor__(_vault: Vault, _path: string): void {
    noop();
  }
}

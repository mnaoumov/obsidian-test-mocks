import type { TAbstractFile as TAbstractFileOriginal } from 'obsidian';

import type { TFolder } from './TFolder.ts';
import type { Vault } from './Vault.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
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
    const self = strictProxy(this);
    self.constructor__(vault, path);
    return self;
  }

  public static fromOriginalType__(value: TAbstractFileOriginal): TAbstractFile {
    return bridgeType<TAbstractFile>(value);
  }

  public asOriginalType__(): TAbstractFileOriginal {
    return bridgeType<TAbstractFileOriginal>(this);
  }

  public constructor__(_vault: Vault, _path: string): void {
    noop();
  }
}

import type {
  BasesEntryGroup as BasesEntryGroupOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';

export class BasesEntryGroup {
  public entries: BasesEntry[];
  public key?: ValueOriginal;

  protected constructor(entries: BasesEntry[], key: unknown) {
    this.entries = entries;
    if (key !== undefined) {
      this.key = key as ValueOriginal;
    }
    const self = strictProxy(this);
    self.constructor__(entries, key);
    return self;
  }

  public static create__(entries: BasesEntry[], key: unknown): BasesEntryGroup {
    return new BasesEntryGroup(entries, key);
  }

  public static fromOriginalType__(value: BasesEntryGroupOriginal): BasesEntryGroup {
    return bridgeType<BasesEntryGroup>(value);
  }

  public asOriginalType__(): BasesEntryGroupOriginal {
    return bridgeType<BasesEntryGroupOriginal>(this);
  }

  public constructor__(_entries: BasesEntry[], _key: unknown): void {
    noop();
  }

  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

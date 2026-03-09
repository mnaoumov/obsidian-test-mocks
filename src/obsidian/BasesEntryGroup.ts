import type {
  BasesEntryGroup as BasesEntryGroupOriginal,
  Value
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class BasesEntryGroup {
  public entries: BasesEntry[];
  public key?: Value;

  protected constructor(entries: BasesEntry[], key: unknown) {
    this.entries = entries;
    if (key !== undefined) {
      this.key = key as Value;
    }
  }

  public static create__(entries: BasesEntry[], key: unknown): BasesEntryGroup {
    return strictMock(new BasesEntryGroup(entries, key));
  }

  public asOriginalType__(): BasesEntryGroupOriginal {
    return castTo<BasesEntryGroupOriginal>(this);
  }

  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

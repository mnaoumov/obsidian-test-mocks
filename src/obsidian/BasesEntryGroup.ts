import { castTo } from '../internal/Cast.ts';
import type {
  BasesEntryGroup as RealBasesEntryGroup,
  Value
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';

export class BasesEntryGroup {
  public entries: BasesEntry[];
  public key?: Value;

  protected constructor(entries: BasesEntry[], key: unknown) {
    this.entries = entries;
    if (key !== undefined) {
      this.key = key as Value;
    }
    const mock = strictMock(this);
    BasesEntryGroup.constructor__(mock, entries, key);
    return mock;
  }

  public static constructor__(_instance: BasesEntryGroup, _entries: BasesEntry[], _key: unknown): void {
    // Spy hook.
  }

  public static create__(entries: BasesEntry[], key: unknown): BasesEntryGroup {
    return new BasesEntryGroup(entries, key);
  }

  public asReal__(): RealBasesEntryGroup {
    return castTo<RealBasesEntryGroup>(this);
  }

  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

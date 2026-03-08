import type { Value } from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';

import { strictMock } from '../internal/StrictMock.ts';

export class BasesEntryGroup {
  public entries: BasesEntry[];
  public key?: Value;

  protected constructor(entries: BasesEntry[], key?: Value) {
    this.entries = entries;
    if (key !== undefined) {
      this.key = key;
    }
    const mock = strictMock(this);
    BasesEntryGroup.constructor__(mock, entries, key);
    return mock;
  }

  public static constructor__(_instance: BasesEntryGroup, _entries: BasesEntry[], _key?: Value): void {
    // Spy hook.
  }

  public static create__(entries: BasesEntry[], key?: unknown): BasesEntryGroup {
    return new BasesEntryGroup(entries, key as undefined | Value);
  }

  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

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
    BasesEntryGroup.__constructor(mock, entries, key);
    return mock;
  }

  public static __constructor(_instance: BasesEntryGroup, _entries: BasesEntry[], _key?: Value): void {
    // Spy hook.
  }

  public static __create(entries: BasesEntry[], key?: Value): BasesEntryGroup {
    return new BasesEntryGroup(entries, key);
  }

  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

/**
 * @file
 *
 * Mock of Obsidian's `BasesEntryGroup`, one group of Bases query results sharing a group-by value.
 */

import type {
  BasesEntryGroup as BasesEntryGroupOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `BasesEntryGroup`: the entries of a Bases query result that share one value of the group-by
 * key.
 *
 * The mock simply holds the entries and key it was created with.
 */
export class BasesEntryGroup {
  /**
   * The entries belonging to this group.
   */
  public entries: BasesEntry[];

  /**
   * The value of the group-by key for this group; left unset when the group was created without a key.
   */
  public key?: ValueOriginal;

  /**
   * Creates a group from its entries and key.
   *
   * @param entries - The entries belonging to the group.
   * @param key - The group-by value; `undefined` leaves {@link BasesEntryGroup.key} unset.
   */
  protected constructor(entries: BasesEntry[], key: unknown) {
    this.entries = entries;
    if (key !== undefined) {
      this.key = key as ValueOriginal;
    }
    const self = strictProxy(this);
    self.constructor__(entries, key);
    return self;
  }

  /**
   * Mock-only factory: creates an entry group, spyable via `vi.spyOn(BasesEntryGroup, 'create__')`.
   *
   * @param entries - The entries belonging to the group.
   * @param key - The group-by value, or `undefined` for none.
   * @returns The new entry group.
   */
  public static create__(entries: BasesEntry[], key: unknown): BasesEntryGroup {
    return new BasesEntryGroup(entries, key);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BasesEntryGroup` as this mock.
   *
   * @param value - The value typed as the original `BasesEntryGroup`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: BasesEntryGroupOriginal): BasesEntryGroup {
    return strictProxy(value, BasesEntryGroup);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BasesEntryGroup` type.
   *
   * @returns The same object, typed as the original `BasesEntryGroup`.
   */
  public asOriginalType__(): BasesEntryGroupOriginal {
    return strictProxy<BasesEntryGroupOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BasesEntryGroup.prototype, 'constructor__')`.
   *
   * @param _entries - The entries the group was created with.
   * @param _key - The group-by value the group was created with.
   */
  public constructor__(_entries: BasesEntry[], _key: unknown): void {
    noop();
  }

  /**
   * Checks whether this group has a key.
   *
   * @returns `true` when {@link BasesEntryGroup.key} is set. Obsidian also treats a null key as absent; the mock
   * only checks for `undefined`.
   */
  public hasKey(): boolean {
    return this.key !== undefined;
  }
}

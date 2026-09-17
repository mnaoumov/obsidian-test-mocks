/**
 * @file
 *
 * Mock of Obsidian's `BasesEntry`, one file's row in a Bases view.
 */

import type {
  BasesEntry as BasesEntryOriginal,
  BasesPropertyId as BasesPropertyIdOriginal,
  FormulaContext as FormulaContextOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `BasesEntry`, a file together with the property values a Bases view computed for it.
 *
 * The mock evaluates nothing: every property is `null` until a test sets it with
 * {@link BasesEntry.setValue__}.
 */
export class BasesEntry implements FormulaContextOriginal {
  /**
   * The file this entry represents.
   */
  public file: TFile;
  private readonly values = new Map<BasesPropertyIdOriginal, null | ValueOriginal>();

  /**
   * Creates an entry with no property values.
   *
   * @param context - The Bases query context the entry belongs to. Unused by the mock.
   * @param file - The file the entry represents.
   */
  protected constructor(context: unknown, file: TFile) {
    this.file = file;
    const self = strictProxy(this);
    self.constructor__(context, file);
    return self;
  }

  /**
   * Mock-only factory: creates an entry, spyable via `vi.spyOn(BasesEntry, 'create__')`.
   *
   * @param context - The Bases query context the entry belongs to.
   * @param file - The file the entry represents.
   * @returns The new entry.
   */
  public static create__(context: unknown, file: TFile): BasesEntry {
    return new BasesEntry(context, file);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BasesEntry` as this mock.
   *
   * @param value - The value typed as the original `BasesEntry`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: BasesEntryOriginal): BasesEntry {
    return strictProxy(value, BasesEntry);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BasesEntry` type.
   *
   * @returns The same object, typed as the original `BasesEntry`.
   */
  public asOriginalType__(): BasesEntryOriginal {
    return strictProxy<BasesEntryOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BasesEntry.prototype, 'constructor__')`.
   *
   * @param _context - The context the entry was created with.
   * @param _file - The file the entry was created with.
   */
  public constructor__(_context: unknown, _file: TFile): void {
    noop();
  }

  /**
   * Gets the value of a property. Obsidian returns evaluation errors as an `ErrorValue`.
   *
   * @param propertyId - The property id, such as `note.status` or `file.name`.
   * @returns The value set with {@link BasesEntry.setValue__}, or `null` when none was set.
   */
  public getValue(propertyId: BasesPropertyIdOriginal): null | ValueOriginal {
    return this.values.get(propertyId) ?? null;
  }

  /**
   * Mock-only: sets the value {@link BasesEntry.getValue} returns for a property.
   *
   * @param propertyId - The property id.
   * @param value - The value to return, or `null`.
   */
  public setValue__(propertyId: BasesPropertyIdOriginal, value: null | ValueOriginal): void {
    this.values.set(propertyId, value);
  }
}

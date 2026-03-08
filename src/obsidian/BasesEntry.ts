import type {
  BasesEntry as BasesEntryOriginal,
  BasesPropertyId,
  FormulaContext,
  Value
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class BasesEntry implements FormulaContext {
  public file: TFile;
  private readonly values = new Map<BasesPropertyId, null | Value>();

  protected constructor(_ctx: unknown, file: TFile) {
    this.file = file;
    const mock = strictMock(this);
    BasesEntry.constructor__(mock, _ctx, file);
    return mock;
  }

  public static constructor__(_instance: BasesEntry, _ctx: unknown, _file: TFile): void {
    // Spy hook.
  }

  public static create__(_ctx: unknown, file: TFile): BasesEntry {
    return new BasesEntry(_ctx, file);
  }

  public asOriginalType__(): BasesEntryOriginal {
    return castTo<BasesEntryOriginal>(this);
  }

  public getValue(propertyId: BasesPropertyId): null | Value {
    return this.values.get(propertyId) ?? null;
  }

  /** @deprecated Mock-only. Sets a value for a property. Not part of the Obsidian API. */
  public setValue__(propertyId: BasesPropertyId, value: null | Value): void {
    this.values.set(propertyId, value);
  }
}

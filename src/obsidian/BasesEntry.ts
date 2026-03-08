import type {
  BasesPropertyId,
  FormulaContext,
  Value
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { strictMock } from '../internal/StrictMock.ts';

export class BasesEntry implements FormulaContext {
  public file: TFile;
  private readonly values = new Map<BasesPropertyId, null | Value>();

  protected constructor(file: TFile) {
    this.file = file;
    const mock = strictMock(this);
    BasesEntry.__constructor(mock, file);
    return mock;
  }

  public static __constructor(_instance: BasesEntry, _file: TFile): void {
    // Spy hook.
  }

  public static __create(file: TFile): BasesEntry {
    return new BasesEntry(file);
  }

  /** @deprecated Mock-only. Sets a value for a property. Not part of the Obsidian API. */
  public __setValue(propertyId: BasesPropertyId, value: null | Value): void {
    this.values.set(propertyId, value);
  }

  public getValue(propertyId: BasesPropertyId): null | Value {
    return this.values.get(propertyId) ?? null;
  }
}

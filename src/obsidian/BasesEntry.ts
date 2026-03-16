import type {
  BasesEntry as BasesEntryOriginal,
  BasesPropertyId as BasesPropertyIdOriginal,
  FormulaContext as FormulaContextOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class BasesEntry implements FormulaContextOriginal {
  public file: TFile;
  private readonly values = new Map<BasesPropertyIdOriginal, null | ValueOriginal>();

  protected constructor(_ctx: unknown, file: TFile) {
    this.file = file;
    const self = strictMock(this);
    self.constructor__(_ctx, file);
    return self;
  }

  public static create__(ctx: unknown, file: TFile): BasesEntry {
    return new BasesEntry(ctx, file);
  }

  public static fromOriginalType__(value: BasesEntryOriginal): BasesEntry {
    return createMockOfUnsafe<BasesEntry>(value);
  }

  public asOriginalType__(): BasesEntryOriginal {
    return createMockOfUnsafe<BasesEntryOriginal>(this);
  }

  public constructor__(_ctx: unknown, _file: TFile): void {
    noop();
  }

  public getValue(propertyId: BasesPropertyIdOriginal): null | ValueOriginal {
    return this.values.get(propertyId) ?? null;
  }

  public setValue__(propertyId: BasesPropertyIdOriginal, value: null | ValueOriginal): void {
    this.values.set(propertyId, value);
  }
}

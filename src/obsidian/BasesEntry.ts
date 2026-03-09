import type {
  BasesEntry as BasesEntryOriginal,
  BasesPropertyId as BasesPropertyIdOriginal,
  FormulaContext as FormulaContextOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class BasesEntry implements FormulaContextOriginal {
  public file: TFile;
  private readonly values = new Map<BasesPropertyIdOriginal, null | ValueOriginal>();

  protected constructor(_ctx: unknown, file: TFile) {
    this.file = file;
  }

  public static create__(ctx: unknown, file: TFile): BasesEntry {
    return strictMock(new BasesEntry(ctx, file));
  }

  public asOriginalType__(): BasesEntryOriginal {
    return castTo<BasesEntryOriginal>(this);
  }

  public getValue(propertyId: BasesPropertyIdOriginal): null | ValueOriginal {
    return this.values.get(propertyId) ?? null;
  }

  public setValue__(propertyId: BasesPropertyIdOriginal, value: null | ValueOriginal): void {
    this.values.set(propertyId, value);
  }
}

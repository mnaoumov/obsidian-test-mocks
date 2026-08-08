import type {
  BasesEntry as BasesEntryOriginal,
  BasesPropertyId as BasesPropertyIdOriginal,
  FormulaContext as FormulaContextOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class BasesEntry implements FormulaContextOriginal {
  public file: TFile;
  private readonly values = new Map<BasesPropertyIdOriginal, null | ValueOriginal>();

  protected constructor(context: unknown, file: TFile) {
    this.file = file;
    const self = strictProxy(this);
    self.constructor__(context, file);
    return self;
  }

  public static create__(context: unknown, file: TFile): BasesEntry {
    return new BasesEntry(context, file);
  }

  public static fromOriginalType__(value: BasesEntryOriginal): BasesEntry {
    return strictProxy(value, BasesEntry);
  }

  public asOriginalType__(): BasesEntryOriginal {
    return strictProxy<BasesEntryOriginal>(this);
  }

  public constructor__(_context: unknown, _file: TFile): void {
    noop();
  }

  public getValue(propertyId: BasesPropertyIdOriginal): null | ValueOriginal {
    return this.values.get(propertyId) ?? null;
  }

  public setValue__(propertyId: BasesPropertyIdOriginal, value: null | ValueOriginal): void {
    this.values.set(propertyId, value);
  }
}

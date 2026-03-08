import type {
  BasesPropertyId,
  BasesQueryResult as BasesQueryResultOriginal,
  Value
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';
import type { BasesEntryGroup } from './BasesEntryGroup.ts';
import type { QueryController } from './QueryController.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class BasesQueryResult {
  public data: BasesEntry[] = [];
  public get groupedData(): BasesEntryGroup[] {
    return this._groupedData;
  }

  public get properties(): BasesPropertyId[] {
    return this._properties;
  }

  private _groupedData: BasesEntryGroup[] = [];

  private _properties: BasesPropertyId[] = [];

  protected constructor() {
    const mock = strictMock(this);
    BasesQueryResult.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: BasesQueryResult): void {
    // Spy hook.
  }

  public static create__(): BasesQueryResult {
    return new BasesQueryResult();
  }

  public asOriginalType__(): BasesQueryResultOriginal {
    return castTo<BasesQueryResultOriginal>(this);
  }

  public getSummaryValue(_queryController: QueryController, _entries: BasesEntry[], _prop: BasesPropertyId, _summaryKey: string): Value {
    throw new Error('getSummaryValue is not implemented in mock');
  }

  /** @deprecated Mock-only. Sets the data entries. Not part of the Obsidian API. */
  public setData__(data: BasesEntry[]): void {
    this.data = data;
  }

  /** @deprecated Mock-only. Sets the grouped data. Not part of the Obsidian API. */
  public setGroupedData__(groupedData: BasesEntryGroup[]): void {
    this._groupedData = groupedData;
  }

  /** @deprecated Mock-only. Sets the properties. Not part of the Obsidian API. */
  public setProperties__(properties: BasesPropertyId[]): void {
    this._properties = properties;
  }
}

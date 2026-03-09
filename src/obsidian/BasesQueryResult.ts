import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesQueryResult as BasesQueryResultOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';
import type { BasesEntryGroup } from './BasesEntryGroup.ts';
import type { QueryController } from './QueryController.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class BasesQueryResult {
  public data: BasesEntry[] = [];
  public get groupedData(): BasesEntryGroup[] {
    return this._groupedData;
  }

  public get properties(): BasesPropertyIdOriginal[] {
    return this._properties;
  }

  private _groupedData: BasesEntryGroup[] = [];

  private _properties: BasesPropertyIdOriginal[] = [];

  protected constructor() {
    noop();
  }

  public static create__(): BasesQueryResult {
    return strictMock(new BasesQueryResult());
  }

  public asOriginalType__(): BasesQueryResultOriginal {
    return castTo<BasesQueryResultOriginal>(this);
  }

  public getSummaryValue(_queryController: QueryController, _entries: BasesEntry[], _prop: BasesPropertyIdOriginal, _summaryKey: string): ValueOriginal {
    throw new Error('getSummaryValue is not implemented in mock');
  }

  public setData__(data: BasesEntry[]): void {
    this.data = data;
  }

  public setGroupedData__(groupedData: BasesEntryGroup[]): void {
    this._groupedData = groupedData;
  }

  public setProperties__(properties: BasesPropertyIdOriginal[]): void {
    this._properties = properties;
  }
}

import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesProperty as BasesPropertyOriginal,
  BasesQueryResult as BasesQueryResultOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { BasesEntry } from './BasesEntry.ts';
import type { BasesEntryGroup } from './BasesEntryGroup.ts';
import type { BasesViewConfig } from './BasesViewConfig.ts';
import type { QueryController } from './QueryController.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
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

  protected constructor(app: App, config: BasesViewConfig, allProperties: BasesPropertyOriginal[], data: BasesEntry[]) {
    const self = strictMock(this);
    self.constructor__(app, config, allProperties, data);
    return self;
  }

  public static create__(app: App, config: BasesViewConfig, allProperties: BasesPropertyOriginal[], data: BasesEntry[]): BasesQueryResult {
    return new BasesQueryResult(app, config, allProperties, data);
  }

  public static fromOriginalType__(value: BasesQueryResultOriginal): BasesQueryResult {
    return createMockOfUnsafe<BasesQueryResult>(value);
  }

  public asOriginalType__(): BasesQueryResultOriginal {
    return createMockOfUnsafe<BasesQueryResultOriginal>(this);
  }

  public constructor__(_app: App, _config: BasesViewConfig, _allProperties: BasesPropertyOriginal[], _data: BasesEntry[]): void {
    noop();
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

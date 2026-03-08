import type {
  BasesPropertyId,
  Value
} from 'obsidian';

import type { BasesEntry } from './BasesEntry.ts';
import type { BasesEntryGroup } from './BasesEntryGroup.ts';
import type { QueryController } from './QueryController.ts';

import { strictMock } from '../internal/StrictMock.ts';

export class BasesQueryResult {
  public data: BasesEntry[];
  public get groupedData(): BasesEntryGroup[] {
    return this._groupedData;
  }

  public get properties(): BasesPropertyId[] {
    return this._properties;
  }

  private readonly _groupedData: BasesEntryGroup[];

  private readonly _properties: BasesPropertyId[];

  protected constructor(data: BasesEntry[], groupedData: BasesEntryGroup[], properties: BasesPropertyId[]) {
    this.data = data;
    this._groupedData = groupedData;
    this._properties = properties;
    const mock = strictMock(this);
    BasesQueryResult.constructor__(mock, data, groupedData, properties);
    return mock;
  }

  public static constructor__(
    _instance: BasesQueryResult,
    _data: BasesEntry[],
    _groupedData: BasesEntryGroup[],
    _properties: BasesPropertyId[]
  ): void {
    // Spy hook.
  }

  public static create__(data: BasesEntry[], groupedData: BasesEntryGroup[], properties: BasesPropertyId[]): BasesQueryResult {
    return new BasesQueryResult(data, groupedData, properties);
  }

  public getSummaryValue(_queryController: QueryController, _entries: BasesEntry[], _prop: BasesPropertyId, _summaryKey: string): Value {
    throw new Error('getSummaryValue is not implemented in mock');
  }
}

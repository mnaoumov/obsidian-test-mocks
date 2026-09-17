/**
 * @file
 *
 * Mock of Obsidian's `BasesQueryResult`, the output of executing a Bases query.
 */

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

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `BasesQueryResult`: everything a Bases view renders after the query runs, its filters apply
 * and its formulas evaluate.
 *
 * The mock runs no query. It starts empty and a test fills it with {@link BasesQueryResult.setData__},
 * {@link BasesQueryResult.setGroupedData__} and {@link BasesQueryResult.setProperties__}.
 */
export class BasesQueryResult {
  /**
   * The ungrouped entries, with the user's sort and limit applied. Empty until
   * {@link BasesQueryResult.setData__} sets it.
   */
  public data: BasesEntry[] = [];

  /**
   * The entries grouped by the configured group-by key; Obsidian returns a single keyless group when none is
   * configured.
   *
   * @returns The groups last set by {@link BasesQueryResult.setGroupedData__}, initially empty.
   */
  public get groupedData(): BasesEntryGroup[] {
    return this._groupedData;
  }

  /**
   * The properties the user has made visible in the view.
   *
   * @returns The properties last set by {@link BasesQueryResult.setProperties__}, initially empty.
   */
  public get properties(): BasesPropertyIdOriginal[] {
    return this._properties;
  }

  private _groupedData: BasesEntryGroup[] = [];

  private _properties: BasesPropertyIdOriginal[] = [];

  /**
   * Creates an empty query result. The arguments are only forwarded to the construction hook.
   *
   * @param app - The app the query runs in.
   * @param config - The configuration of the view the query belongs to.
   * @param allProperties - All properties available in the dataset.
   * @param data - The query's entries; not stored by the mock.
   */
  protected constructor(app: App, config: BasesViewConfig, allProperties: BasesPropertyOriginal[], data: BasesEntry[]) {
    const self = strictProxy(this);
    self.constructor__(app, config, allProperties, data);
    return self;
  }

  /**
   * Mock-only factory: creates a query result, spyable via `vi.spyOn(BasesQueryResult, 'create__')`.
   *
   * @param app - The app the query runs in.
   * @param config - The configuration of the view the query belongs to.
   * @param allProperties - All properties available in the dataset.
   * @param data - The query's entries; not stored, use {@link BasesQueryResult.setData__} for that.
   * @returns The new, empty query result.
   */
  public static create__(app: App, config: BasesViewConfig, allProperties: BasesPropertyOriginal[], data: BasesEntry[]): BasesQueryResult {
    return new BasesQueryResult(app, config, allProperties, data);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BasesQueryResult` as this mock.
   *
   * @param value - The value typed as the original `BasesQueryResult`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: BasesQueryResultOriginal): BasesQueryResult {
    return strictProxy(value, BasesQueryResult);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BasesQueryResult` type.
   *
   * @returns The same object, typed as the original `BasesQueryResult`.
   */
  public asOriginalType__(): BasesQueryResultOriginal {
    return strictProxy<BasesQueryResultOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BasesQueryResult.prototype, 'constructor__')`.
   *
   * @param _app - The app the result was created with.
   * @param _config - The view configuration the result was created with.
   * @param _allProperties - The available properties the result was created with.
   * @param _data - The entries the result was created with.
   */
  public constructor__(_app: App, _config: BasesViewConfig, _allProperties: BasesPropertyOriginal[], _data: BasesEntry[]): void {
    noop();
  }

  /**
   * Applies a summary function to one property over a set of entries. Not implemented in the mock.
   *
   * @param _queryController - The controller of the query being summarized.
   * @param _entries - The entries to summarize.
   * @param _property - The property whose values are summarized.
   * @param _summaryKey - The key of the summary function to apply.
   * @throws Always, since the mock does not implement summaries.
   */
  public getSummaryValue(_queryController: QueryController, _entries: BasesEntry[], _property: BasesPropertyIdOriginal, _summaryKey: string): ValueOriginal {
    throw new Error('getSummaryValue is not implemented in mock');
  }

  /**
   * Mock-only: replaces {@link BasesQueryResult.data}, simulating a query that produced these entries.
   *
   * @param data - The ungrouped entries.
   */
  public setData__(data: BasesEntry[]): void {
    this.data = data;
  }

  /**
   * Mock-only: sets the groups returned by {@link BasesQueryResult.groupedData}.
   *
   * @param groupedData - The entry groups.
   */
  public setGroupedData__(groupedData: BasesEntryGroup[]): void {
    this._groupedData = groupedData;
  }

  /**
   * Mock-only: sets the visible properties returned by {@link BasesQueryResult.properties}.
   *
   * @param properties - The visible property ids.
   */
  public setProperties__(properties: BasesPropertyIdOriginal[]): void {
    this._properties = properties;
  }
}

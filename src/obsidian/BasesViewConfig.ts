import type {
  BasesPropertyId,
  BasesSortConfig,
  Value
} from 'obsidian';

import type { BasesView } from './BasesView.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { NullValue } from './NullValue.ts';

export class BasesViewConfig {
  public name: string;
  private readonly config = new Map<string, unknown>();
  private readonly displayNames = new Map<BasesPropertyId, string>();
  private order: BasesPropertyId[] = [];
  private sort: BasesSortConfig[] = [];

  protected constructor(name: string) {
    this.name = name;
    const mock = strictMock(this);
    BasesViewConfig.constructor__(mock, name);
    return mock;
  }

  public static constructor__(_instance: BasesViewConfig, _name: string): void {
    // Spy hook.
  }

  public static create__(name: string): BasesViewConfig {
    return new BasesViewConfig(name);
  }

  /** @deprecated Mock-only. Sets the display name for a property. Not part of the Obsidian API. */
  public setDisplayName__(propertyId: BasesPropertyId, displayName: string): void {
    this.displayNames.set(propertyId, displayName);
  }

  /** @deprecated Mock-only. Sets the property order. Not part of the Obsidian API. */
  public setOrder__(order: BasesPropertyId[]): void {
    this.order = order;
  }

  /** @deprecated Mock-only. Sets the sort config. Not part of the Obsidian API. */
  public setSort__(sort: BasesSortConfig[]): void {
    this.sort = sort;
  }

  public get(key: string): unknown {
    return this.config.get(key);
  }

  public getAsPropertyId(key: string): BasesPropertyId | null {
    const value = this.config.get(key);
    if (typeof value === 'string') {
      return value as BasesPropertyId;
    }
    return null;
  }

  public getDisplayName(propertyId: BasesPropertyId): string {
    return this.displayNames.get(propertyId) ?? propertyId.slice(propertyId.indexOf('.') + 1);
  }

  public getEvaluatedFormula(_view: BasesView, _key: string): Value {
    return new NullValue();
  }

  public getOrder(): BasesPropertyId[] {
    return this.order;
  }

  public getSort(): BasesSortConfig[] {
    return this.sort;
  }

  public set(key: string, value: unknown): void {
    this.config.set(key, value);
  }
}

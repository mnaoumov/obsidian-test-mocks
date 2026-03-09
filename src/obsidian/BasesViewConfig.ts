import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesSortConfig as BasesSortConfigOriginal,
  BasesViewConfig as BasesViewConfigOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesView } from './BasesView.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NullValue } from './NullValue.ts';

export class BasesViewConfig {
  public name: string;
  private readonly config = new Map<string, unknown>();
  private readonly displayNames = new Map<BasesPropertyIdOriginal, string>();
  private order: BasesPropertyIdOriginal[] = [];
  private sort: BasesSortConfigOriginal[] = [];

  protected constructor(_query: string, _type: string, name: string) {
    this.name = name;
  }

  public static create__(query: string, type: string, name: string): BasesViewConfig {
    return strictMock(new BasesViewConfig(query, type, name));
  }

  public asOriginalType__(): BasesViewConfigOriginal {
    return castTo<BasesViewConfigOriginal>(this);
  }

  public get(key: string): unknown {
    return this.config.get(key);
  }

  public getAsPropertyId(key: string): BasesPropertyIdOriginal | null {
    const value = this.config.get(key);
    if (typeof value === 'string') {
      return value as BasesPropertyIdOriginal;
    }
    return null;
  }

  public getDisplayName(propertyId: BasesPropertyIdOriginal): string {
    return this.displayNames.get(propertyId) ?? propertyId.slice(propertyId.indexOf('.') + 1);
  }

  public getEvaluatedFormula(_view: BasesView, _key: string): ValueOriginal {
    return NullValue.create__();
  }

  public getOrder(): BasesPropertyIdOriginal[] {
    return this.order;
  }

  public getSort(): BasesSortConfigOriginal[] {
    return this.sort;
  }

  public set(key: string, value: unknown): void {
    this.config.set(key, value);
  }

  /** Mock-only. Sets the display name for a property. Not part of the Obsidian API. */
  public setDisplayName__(propertyId: BasesPropertyIdOriginal, displayName: string): void {
    this.displayNames.set(propertyId, displayName);
  }

  /** Mock-only. Sets the property order. Not part of the Obsidian API. */
  public setOrder__(order: BasesPropertyIdOriginal[]): void {
    this.order = order;
  }

  /** Mock-only. Sets the sort config. Not part of the Obsidian API. */
  public setSort__(sort: BasesSortConfigOriginal[]): void {
    this.sort = sort;
  }
}

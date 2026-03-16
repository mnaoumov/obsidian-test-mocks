import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesSortConfig as BasesSortConfigOriginal,
  BasesViewConfig as BasesViewConfigOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesView } from './BasesView.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { NullValue } from './NullValue.ts';

export class BasesViewConfig {
  public name: string;
  private readonly config = new Map<string, unknown>();
  private readonly displayNames = new Map<BasesPropertyIdOriginal, string>();
  private order: BasesPropertyIdOriginal[] = [];
  private sort: BasesSortConfigOriginal[] = [];

  protected constructor(_query: string, _type: string, name: string) {
    this.name = name;
    const self = strictProxyForce(this);
    self.constructor__(_query, _type, name);
    return self;
  }

  public static create__(query: string, type: string, name: string): BasesViewConfig {
    return new BasesViewConfig(query, type, name);
  }

  public static fromOriginalType__(value: BasesViewConfigOriginal): BasesViewConfig {
    return strictProxyForce(value, BasesViewConfig);
  }

  public asOriginalType__(): BasesViewConfigOriginal {
    return strictProxyForce<BasesViewConfigOriginal>(this);
  }

  public constructor__(_query: string, _type: string, _name: string): void {
    noop();
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

  public setDisplayName__(propertyId: BasesPropertyIdOriginal, displayName: string): void {
    this.displayNames.set(propertyId, displayName);
  }

  public setOrder__(order: BasesPropertyIdOriginal[]): void {
    this.order = order;
  }

  public setSort__(sort: BasesSortConfigOriginal[]): void {
    this.sort = sort;
  }
}

/**
 * @file
 *
 * Mock of Obsidian's `BasesViewConfig`, the settings of one view in a Bases file.
 */

import type {
  BasesPropertyId as BasesPropertyIdOriginal,
  BasesSortConfig as BasesSortConfigOriginal,
  BasesViewConfig as BasesViewConfigOriginal,
  Value as ValueOriginal
} from 'obsidian';

import type { BasesView } from './BasesView.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NullValue } from './NullValue.ts';

/**
 * Mock of Obsidian's `BasesViewConfig`: the in-memory form of one entry in a Bases file's `views` section.
 *
 * The mock keeps options, display names, property order and sort in memory; it evaluates no formulas.
 */
export class BasesViewConfig {
  /**
   * The user-facing name of the view.
   */
  public name: string;
  private readonly config = new Map<string>();
  private readonly displayNames = new Map<BasesPropertyIdOriginal, string>();
  private order: BasesPropertyIdOriginal[] = [];
  private sort: BasesSortConfigOriginal[] = [];

  /**
   * Creates an empty view configuration.
   *
   * @param query - The Base's query; only forwarded to the construction hook.
   * @param type - The view type id; only forwarded to the construction hook.
   * @param name - The user-facing name of the view.
   */
  protected constructor(query: string, type: string, name: string) {
    this.name = name;
    const self = strictProxy(this);
    self.constructor__(query, type, name);
    return self;
  }

  /**
   * Mock-only factory: creates a view configuration, spyable via `vi.spyOn(BasesViewConfig, 'create__')`.
   *
   * @param query - The Base's query.
   * @param type - The view type id.
   * @param name - The user-facing name of the view.
   * @returns The new view configuration.
   */
  public static create__(query: string, type: string, name: string): BasesViewConfig {
    return new BasesViewConfig(query, type, name);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BasesViewConfig` as this mock.
   *
   * @param value - The value typed as the original `BasesViewConfig`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: BasesViewConfigOriginal): BasesViewConfig {
    return strictProxy(value, BasesViewConfig);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BasesViewConfig` type.
   *
   * @returns The same object, typed as the original `BasesViewConfig`.
   */
  public asOriginalType__(): BasesViewConfigOriginal {
    return strictProxy<BasesViewConfigOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BasesViewConfig.prototype, 'constructor__')`.
   *
   * @param _query - The query the configuration was created with.
   * @param _type - The view type id the configuration was created with.
   * @param _name - The name the configuration was created with.
   */
  public constructor__(_query: string, _type: string, _name: string): void {
    noop();
  }

  /**
   * Reads a user-configured view option.
   *
   * @param key - The option key.
   * @returns The value stored with {@link BasesViewConfig.set}, or `undefined` when none is.
   */
  public get(key: string): unknown {
    return this.config.get(key);
  }

  /**
   * Reads a user-configured option as a property id.
   *
   * @param key - The option key.
   * @returns The stored value when it is a string, otherwise `null`. Unlike Obsidian, the mock does not validate
   * the id.
   */
  public getAsPropertyId(key: string): BasesPropertyIdOriginal | null {
    const value = this.config.get(key);
    return typeof value === 'string' ? (value as BasesPropertyIdOriginal) : null;
  }

  /**
   * Gets the user-facing name of a property.
   *
   * @param propertyId - The property id, such as `note.status`.
   * @returns The name set with {@link BasesViewConfig.setDisplayName__}, otherwise the id without its type prefix.
   */
  public getDisplayName(propertyId: BasesPropertyIdOriginal): string {
    return this.displayNames.get(propertyId) ?? propertyId.slice(propertyId.indexOf('.') + 1);
  }

  /**
   * Evaluates a configured option as a formula in the context of the current Base. The mock evaluates nothing.
   *
   * @param _view - The view to evaluate the formula for.
   * @param _key - The option key holding the formula.
   * @returns Always a new `NullValue`, which Obsidian returns for an invalid formula or a missing key.
   */
  public getEvaluatedFormula(_view: BasesView, _key: string): ValueOriginal {
    return NullValue.create__();
  }

  /**
   * Gets the ordered list of properties the view displays, such as a table's visible columns.
   *
   * @returns The order last set with {@link BasesViewConfig.setOrder}, initially empty.
   */
  public getOrder(): BasesPropertyIdOriginal[] {
    return this.order;
  }

  /**
   * Gets the view's sort configuration.
   *
   * @returns The sort last set with {@link BasesViewConfig.setSort__}, initially empty.
   */
  public getSort(): BasesSortConfigOriginal[] {
    return this.sort;
  }

  /**
   * Stores a configuration value for the view, in memory in the mock.
   *
   * @param key - The option key.
   * @param value - The value to store.
   */
  public set(key: string, value: unknown): void {
    this.config.set(key, value);
  }

  /**
   * Mock-only: simulates the user renaming a property, which {@link BasesViewConfig.getDisplayName} then returns.
   *
   * @param propertyId - The property id.
   * @param displayName - The name to show for it.
   */
  public setDisplayName__(propertyId: BasesPropertyIdOriginal, displayName: string): void {
    this.displayNames.set(propertyId, displayName);
  }

  /**
   * Sets the ordered list of displayed properties returned by {@link BasesViewConfig.getOrder}.
   *
   * @param order - The property ids, in display order.
   */
  public setOrder(order: BasesPropertyIdOriginal[]): void {
    this.order = order;
  }

  /**
   * Mock-only: simulates the user configuring the sort returned by {@link BasesViewConfig.getSort}.
   *
   * @param sort - The sort configuration.
   */
  public setSort__(sort: BasesSortConfigOriginal[]): void {
    this.sort = sort;
  }
}

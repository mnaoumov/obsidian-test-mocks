/**
 * @file
 *
 * Mock of Obsidian's `SettingTab`, a tab of the settings modal rendered imperatively or from declarative
 * setting definitions.
 */

import type {
  IconName as IconNameOriginal,
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  Setting as SettingOriginal,
  SettingTab as SettingTabOriginal
} from 'obsidian';

import type {
  RenderedSettingGroup,
  RenderedSettingRow
} from '../internal/setting-definition-renderer.ts';
import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import {
  applyDomState,
  renderSettingDefinitions
} from '../internal/setting-definition-renderer.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `SettingTab` base class.
 *
 * {@link SettingTab.renderTab} renders the stored {@link SettingTab.settingItems} into the detached
 * {@link SettingTab.containerEl} the way Obsidian 1.13 does, or falls back to {@link SettingTab.display} when there
 * are none; the rendered rows can be read back with {@link SettingTab.getRenderedRows__}.
 */
export abstract class SettingTab {
  /**
   * Reference to the app instance.
   */
  public app: App;

  /**
   * The element the tab's content is rendered into; detached in the mock.
   */
  public containerEl: HTMLDivElement;

  /**
   * The icon to display in the settings sidebar; empty until a subclass sets it.
   */
  public icon: IconNameOriginal = '';

  /**
   * The setting definitions last returned by {@link SettingTab.getSettingDefinitions}, stored by
   * {@link SettingTab.update}.
   */
  public settingItems: SettingDefinitionItemOriginal[] = [];

  private renderedGroups: RenderedSettingGroup[] = [];

  /**
   * Creates the tab with a detached content container.
   *
   * @param app - The app instance.
   * @param setting - The setting modal the tab belongs to, if any; the mock only passes it to the construction hook.
   */
  public constructor(app: App, setting?: SettingOriginal) {
    this.app = app;
    this.containerEl = createDiv();
    const self = strictProxy(this);
    self.constructor__(app, setting);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SettingTab` as this mock.
   *
   * @param value - The value typed as the original `SettingTab`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: SettingTabOriginal): SettingTab {
    return strictProxy(value, SettingTab);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SettingTab` type.
   *
   * @returns The same object, typed as the original `SettingTab`.
   */
  public asOriginalType__(): SettingTabOriginal {
    return strictProxy<SettingTabOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SettingTab.prototype, 'constructor__')`.
   *
   * @param _app - The app the tab was created with.
   * @param _setting - The setting modal the tab was created with.
   */
  public constructor__(_app: App, _setting?: SettingOriginal): void {
    noop();
  }

  /**
   * Renders the tab imperatively; only called when there are no setting definitions. Obsidian deprecates it in
   * favor of {@link SettingTab.getSettingDefinitions}. A no-op in the base mock.
   */
  public display(): void {
    noop();
  }

  /**
   * Reads the current value for a `control` setting key. Obsidian's default reads `app.vault.getConfig`; the mock
   * always returns `undefined`.
   *
   * @param _key - The control key.
   * @returns The control's current value; always `undefined` in the mock.
   */
  public getControlValue(_key: string): unknown {
    return undefined;
  }

  /**
   * Mock-only: returns every setting row rendered by the last {@link SettingTab.renderTab}, flattened across groups.
   *
   * @returns The rendered rows; empty after {@link SettingTab.hide} or an imperative render.
   */
  public getRenderedRows__(): RenderedSettingRow[] {
    return this.renderedGroups.flatMap((group) => group.children);
  }

  /**
   * Provides the tab's declarative setting definitions; subclasses override it. The base returns none.
   *
   * @returns The setting definitions and inline groups; an empty array in the base mock.
   */
  public getSettingDefinitions(): SettingDefinitionItemOriginal[] {
    return [];
  }

  /**
   * Hides the tab's contents. The mock forgets the rendered rows and empties {@link SettingTab.containerEl}.
   */
  public hide(): void {
    this.renderedGroups = [];
    this.containerEl.replaceChildren();
  }

  /**
   * Re-evaluates every `visible` and `disabled` predicate and applies the result to the rendered DOM, without
   * re-rendering.
   */
  public refreshDomState(): void {
    applyDomState(this.renderedGroups);
  }

  /**
   * Renders the tab: declaratively from {@link SettingTab.settingItems} into {@link SettingTab.containerEl}, or by
   * calling {@link SettingTab.display} when there are no items.
   */
  public renderTab(): void {
    if (this.settingItems.length === 0) {
      this.renderedGroups = [];
      this.display();
      return;
    }

    this.renderedGroups = renderSettingDefinitions(this.settingItems, this.containerEl);
  }

  /**
   * Persists a new value for a `control` setting key. Obsidian's default writes `app.vault.setConfig`; a no-op in the
   * mock.
   *
   * @param _key - The control key.
   * @param _value - The new value.
   */
  public setControlValue(_key: string, _value: unknown): void {
    noop();
  }

  /**
   * Stores the result of {@link SettingTab.getSettingDefinitions} in {@link SettingTab.settingItems} for rendering.
   */
  public update(): void {
    this.settingItems = this.getSettingDefinitions();
  }
}

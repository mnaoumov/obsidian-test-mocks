/**
 * @file
 *
 * Mock of Obsidian's `SettingGroup`, a titled group of setting rows.
 */

import type {
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  SettingGroup as SettingGroupOriginal,
  Setting as SettingOriginal
} from 'obsidian';

import type { BaseComponent } from './BaseComponent.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

/**
 * Mock of Obsidian's `SettingGroup`, which groups setting rows under an optional heading.
 *
 * The DOM mirrors Obsidian's: {@link SettingGroup.groupEl} holds a search container (`.setting-group-search`),
 * {@link SettingGroup.listEl}, and a heading row (a name and {@link SettingGroup.controlEl}) that is attached at the
 * top of the group only while it has a heading or a control. Every added row or control is handed to its callback synchronously.
 */
export class SettingGroup {
  /**
   * The components added to the group itself (its search input and extra buttons), in the order they were added.
   */
  public components: BaseComponent[] = [];

  /**
   * The element in the heading row that holds the group's extra buttons.
   */
  public controlEl: HTMLDivElement;

  /**
   * The group's outer element, holding the heading, the search container and the list.
   */
  public groupEl: HTMLDivElement;

  /**
   * The element the group's settings are added to.
   */
  public listEl: HTMLDivElement;

  /**
   * The setting rows added with {@link SettingGroup.addSetting}, in order.
   */
  public settings: Setting[] = [];

  private readonly headerEl: HTMLDivElement;
  private readonly headerInnerEl: HTMLDivElement;
  private readonly searchContainerEl: HTMLDivElement;

  /**
   * Creates the group inside `containerEl`, without a heading.
   *
   * @param containerEl - The element to create the group in.
   */
  public constructor(containerEl: HTMLElement) {
    this.groupEl = containerEl.createDiv('setting-group');
    this.headerEl = createDiv('setting-item setting-item-heading');
    this.headerInnerEl = this.headerEl.createDiv('setting-item-name');
    this.controlEl = this.headerEl.createDiv('setting-item-control');
    this.searchContainerEl = this.groupEl.createDiv({ attr: { tabIndex: -1 }, cls: 'setting-group-search' });
    this.listEl = this.groupEl.createDiv('setting-items');
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a setting group, spyable via `vi.spyOn(SettingGroup, 'create__')`.
   *
   * @param containerEl - The element to create the group in.
   * @returns The new setting group.
   */
  public static create__(containerEl: HTMLElement): SettingGroup {
    return new SettingGroup(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SettingGroup` as this mock.
   *
   * @param value - The value typed as the original `SettingGroup`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: SettingGroupOriginal): SettingGroup {
    return strictProxy(value, SettingGroup);
  }

  /**
   * Adds CSS classes to the group's outer element.
   *
   * @param classes - The class names to add.
   * @returns This group, for chaining.
   */
  public addClass(...classes: string[]): this {
    this.groupEl.addClass(...classes);
    return this;
  }

  /**
   * Adds an extra (icon) button to the group's heading row, attaching the heading row if it is not already shown.
   *
   * @param callback - Called with the new button, to configure it.
   * @returns This group, for chaining.
   */
  public addExtraButton(callback: (component: ExtraButtonComponentOriginal) => unknown): this {
    this.showHeader();
    const comp = ExtraButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType2__());
    return this;
  }

  /**
   * Adds a search input to the group's search container, at the start of the group, for filtering its rows or for
   * quick entry.
   *
   * @param callback - Called with the new search component, to configure it.
   * @returns This group, for chaining.
   */
  public addSearch(callback: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.searchContainerEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  /**
   * Adds a setting row to the group's list.
   *
   * @param callback - Called with the new setting, to configure it.
   * @returns This group, for chaining.
   */
  public addSetting(callback: (setting: SettingOriginal) => void): this {
    const setting = Setting.create__(this.listEl);
    this.settings.push(setting);
    callback(setting.asOriginalType__());
    return this;
  }

  /**
   * Mock-only: views this mock as Obsidian's `SettingGroup` type.
   *
   * @returns The same object, typed as the original `SettingGroup`.
   */
  public asOriginalType__(): SettingGroupOriginal {
    return strictProxy<SettingGroupOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SettingGroup.prototype, 'constructor__')`.
   *
   * @param _containerEl - The element the group was created in.
   */
  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Sets the group's heading. The heading row is attached at the top of {@link SettingGroup.groupEl} while the
   * heading is non-empty or {@link SettingGroup.controlEl} holds a control, and detached otherwise.
   *
   * Obsidian tests whether the heading row is shown with `isShown()`, which is always `false` without layout, so the
   * mock tests whether the row is attached instead.
   *
   * @param text - The heading, as text or as a fragment.
   * @returns This group, for chaining.
   */
  public setHeading(text: DocumentFragment | string): this {
    this.headerInnerEl.setText(text);
    const shouldShow = Boolean(text) || this.controlEl.childElementCount > 0;

    if (shouldShow) {
      this.showHeader();
    } else {
      this.headerEl.detach();
    }

    return this;
  }

  private showHeader(): void {
    if (this.headerEl.parentElement !== this.groupEl) {
      this.groupEl.prepend(this.headerEl);
    }
  }
}

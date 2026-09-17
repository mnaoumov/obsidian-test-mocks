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

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { Setting } from './Setting.ts';

/**
 * Mock of Obsidian's `SettingGroup`, which groups setting rows under an optional heading.
 *
 * Every added row or control is created in {@link SettingGroup.listEl} and handed to its callback synchronously.
 */
export class SettingGroup {
  /**
   * The group's outer element, holding the heading and the list.
   */
  public groupEl: HTMLDivElement;

  /**
   * The element the group's settings and controls are added to.
   */
  public listEl: HTMLDivElement;
  private readonly headerEl: HTMLDivElement;
  private readonly headerInnerEl: HTMLDivElement;

  /**
   * Creates the group inside `containerEl`, without a heading.
   *
   * @param containerEl - The element to create the group in.
   */
  public constructor(containerEl: HTMLElement) {
    this.groupEl = containerEl.createDiv();
    this.headerEl = createDiv();
    this.headerInnerEl = this.headerEl.createDiv();
    this.listEl = this.groupEl.createDiv();
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
   * Adds CSS classes to the group's list element.
   *
   * @param classes - The class names to add.
   * @returns This group, for chaining.
   */
  public addClass(...classes: string[]): this {
    this.listEl.classList.add(...classes);
    return this;
  }

  /**
   * Adds an extra (icon) button to the group.
   *
   * @param callback - Called with the new button, to configure it.
   * @returns This group, for chaining.
   */
  public addExtraButton(callback: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.listEl);
    callback(comp.asOriginalType2__());
    return this;
  }

  /**
   * Adds a search input to the group. Obsidian places it at the start of the group, for filtering its rows or for
   * quick entry; the mock appends it to {@link SettingGroup.listEl}.
   *
   * @param callback - Called with the new search component, to configure it.
   * @returns This group, for chaining.
   */
  public addSearch(callback: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.listEl);
    callback(comp.asOriginalType4__());
    return this;
  }

  /**
   * Adds a setting row to the group.
   *
   * @param callback - Called with the new setting, to configure it.
   * @returns This group, for chaining.
   */
  public addSetting(callback: (setting: SettingOriginal) => void): this {
    const setting = Setting.create__(this.listEl);
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
   * Sets the group's heading. A non-empty heading is inserted at the top of {@link SettingGroup.groupEl}; an empty
   * one removes the heading element when it is shown.
   *
   * @param text - The heading, as text or as a fragment.
   * @returns This group, for chaining.
   */
  public setHeading(text: DocumentFragment | string): this {
    this.headerInnerEl.setText(text);

    if (text && !this.headerEl.isShown()) {
      this.groupEl.prepend(this.headerEl);
    } else if (!text && this.headerEl.isShown()) {
      this.headerEl.detach();
    }

    return this;
  }
}

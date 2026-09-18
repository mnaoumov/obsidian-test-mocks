/**
 * @file
 *
 * Mock of Obsidian's `Setting`, one row of a settings tab with a name, description and controls.
 */

import type {
  ButtonComponent as ButtonComponentOriginal,
  ColorComponent as ColorComponentOriginal,
  DisplayValueComponent as DisplayValueComponentOriginal,
  DropdownComponent as DropdownComponentOriginal,
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  IconName as IconNameOriginal,
  MomentFormatComponent as MomentFormatComponentOriginal,
  ProgressBarComponent as ProgressBarComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  Setting as SettingOriginal,
  SliderComponent as SliderComponentOriginal,
  TextAreaComponent as TextAreaComponentOriginal,
  TextComponent as TextComponentOriginal,
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import type { BaseComponent } from './BaseComponent.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ButtonComponent } from './ButtonComponent.ts';
import { ColorComponent } from './ColorComponent.ts';
import { DisplayValueComponent } from './DisplayValueComponent.ts';
import { DropdownComponent } from './DropdownComponent.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { MomentFormatComponent } from './MomentFormatComponent.ts';
import { ProgressBarComponent } from './ProgressBarComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { SliderComponent } from './SliderComponent.ts';
import { TextAreaComponent } from './TextAreaComponent.ts';
import { TextComponent } from './TextComponent.ts';
import { ToggleComponent } from './ToggleComponent.ts';
import { Platform } from './vars/Platform.ts';

/**
 * Mock of Obsidian's `Setting`, a settings row with an info area (name and description) and a control area.
 *
 * The row is built as Obsidian builds it: `settingEl` (`setting-item`) holds `infoEl` (`setting-item-info`), which
 * holds `nameEl` (`setting-item-name`) and `descEl` (`setting-item-description`), followed by `controlEl`
 * (`setting-item-control`).
 *
 * Each `add*` method creates the real mock component in {@link Setting.controlEl}, hands it to the callback
 * synchronously, and (except for {@link Setting.addDisplayValue}, as in Obsidian) records it in
 * {@link Setting.components}.
 */
export class Setting {
  /**
   * The components added to the row, in the order they were added.
   */
  public components: BaseComponent[] = [];

  /**
   * The element holding the row's controls.
   */
  public controlEl: HTMLElement;

  /**
   * The element holding the row's description.
   */
  public descEl: HTMLElement;

  /**
   * Whether the row is disabled, as set by {@link Setting.setDisabled}.
   */
  public disabled = false;

  /**
   * The validation error element created by {@link Setting.setErrorMessage}, or `null` when no error is shown.
   */
  public errorEl: HTMLElement | null = null;

  /**
   * The element holding the row's icon, created by {@link Setting.setIcon} on its first call and `null` until then.
   */
  public iconEl: HTMLDivElement | null = null;

  /**
   * The element holding the row's name and description.
   */
  public infoEl: HTMLElement;

  /**
   * The element holding the row's name.
   */
  public nameEl: HTMLElement;

  /**
   * The handler run when the row is clicked, as recorded by {@link Setting.setRowClick}, or `null` when the row has no
   * handler.
   */
  public rowClick: (() => void) | null = null;

  /**
   * The row's outer element.
   */
  public settingEl: HTMLElement;

  /**
   * Creates the setting row inside `containerEl`.
   *
   * @param containerEl - The element to create the row in.
   */
  public constructor(containerEl: HTMLElement) {
    this.settingEl = containerEl.createDiv({ attr: { tabIndex: -1 }, cls: 'setting-item' });
    this.infoEl = this.settingEl.createDiv('setting-item-info');
    this.nameEl = this.infoEl.createDiv('setting-item-name');
    this.descEl = this.infoEl.createDiv('setting-item-description');
    this.controlEl = this.settingEl.createDiv('setting-item-control');
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a setting row, spyable via `vi.spyOn(Setting, 'create__')`.
   *
   * @param containerEl - The element to create the row in.
   * @returns The new setting row.
   */
  public static create__(containerEl: HTMLElement): Setting {
    return new Setting(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Setting` as this mock.
   *
   * @param value - The value typed as the original `Setting`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: SettingOriginal): Setting {
    return strictProxy(value, Setting);
  }

  /**
   * Adds a button to the row.
   *
   * @param callback - Called with the new button, to configure it.
   * @returns This setting, for chaining.
   */
  public addButton(callback: (component: ButtonComponentOriginal) => unknown): this {
    const comp = ButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType2__());
    return this;
  }

  /**
   * Adds a color picker to the row.
   *
   * @param callback - Called with the new color picker, to configure it.
   * @returns This setting, for chaining.
   */
  public addColorPicker(callback: (component: ColorComponentOriginal) => unknown): this {
    const comp = ColorComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  /**
   * Adds a custom component to the row.
   *
   * @param callback - Called with {@link Setting.controlEl}; returns the component it created there.
   * @returns This setting, for chaining.
   */
  public addComponent(callback: (el: HTMLElement) => BaseComponent): this {
    const component = callback(this.controlEl);
    this.components.push(component);
    return this;
  }

  /**
   * Adds a read-only display value to the row. On a navigable row, Obsidian uses it to surface the value edited on
   * the page the row opens. As in Obsidian, it is not recorded in {@link Setting.components}.
   *
   * @param callback - Called with the new display value component, to configure it.
   * @returns This setting, for chaining.
   */
  public addDisplayValue(callback: (component: DisplayValueComponentOriginal) => unknown): this {
    const comp = DisplayValueComponent.create__(this.controlEl);
    callback(comp.asOriginalType__());
    return this;
  }

  /**
   * Adds a dropdown to the row.
   *
   * @param callback - Called with the new dropdown, to configure it.
   * @returns This setting, for chaining.
   */
  public addDropdown(callback: (component: DropdownComponentOriginal) => unknown): this {
    const comp = DropdownComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  /**
   * Adds an extra (icon) button to the row.
   *
   * @param callback - Called with the new button, to configure it.
   * @returns This setting, for chaining.
   */
  public addExtraButton(callback: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType2__());
    return this;
  }

  /**
   * Adds a moment.js date format input to the row.
   *
   * @param callback - Called with the new format input, to configure it.
   * @returns This setting, for chaining.
   */
  public addMomentFormat(callback: (component: MomentFormatComponentOriginal) => unknown): this {
    const comp = MomentFormatComponent.create2__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType5__());
    return this;
  }

  /**
   * Adds a progress bar to the row.
   *
   * @param callback - Called with the new progress bar, to configure it.
   * @returns This setting, for chaining.
   */
  public addProgressBar(callback: (component: ProgressBarComponentOriginal) => unknown): this {
    const comp = ProgressBarComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  /**
   * Adds a search input to the row.
   *
   * @param callback - Called with the new search input, to configure it.
   * @returns This setting, for chaining.
   */
  public addSearch(callback: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  /**
   * Adds a slider to the row.
   *
   * @param callback - Called with the new slider, to configure it.
   * @returns This setting, for chaining.
   */
  public addSlider(callback: (component: SliderComponentOriginal) => unknown): this {
    const comp = SliderComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  /**
   * Adds a single-line text input to the row.
   *
   * As in Obsidian, when `Platform.hasPhysicalKeyboard` is `false` the input is blurred on `Enter`, dismissing the
   * soft keyboard rather than letting the key reach a single-line field. An event that is composing or already
   * default-prevented is left alone. This is the only `add*` method Obsidian guards this way.
   *
   * @param callback - Called with the new text input, to configure it.
   * @returns This setting, for chaining.
   */
  public addText(callback: (component: TextComponentOriginal) => unknown): this {
    const comp = TextComponent.create__(this.controlEl);
    if (!Platform.hasPhysicalKeyboard) {
      const { inputEl } = comp;
      inputEl.addEventListener('keydown', (event) => {
        if (event.isComposing || event.defaultPrevented || event.key !== 'Enter') {
          return;
        }
        inputEl.blur();
      });
    }
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  /**
   * Adds a multi-line text area to the row.
   *
   * @param callback - Called with the new text area, to configure it.
   * @returns This setting, for chaining.
   */
  public addTextArea(callback: (component: TextAreaComponentOriginal) => unknown): this {
    const comp = TextAreaComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  /**
   * Adds a toggle switch to the row, marking the row `mod-toggle` once the callback has run, as Obsidian does.
   *
   * @param callback - Called with the new toggle, to configure it.
   * @returns This setting, for chaining.
   */
  public addToggle(callback: (component: ToggleComponentOriginal) => unknown): this {
    const comp = ToggleComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    this.settingEl.addClass('mod-toggle');
    return this;
  }

  /**
   * Mock-only: views this mock as Obsidian's `Setting` type.
   *
   * @returns The same object, typed as the original `Setting`.
   */
  public asOriginalType__(): SettingOriginal {
    return strictProxy<SettingOriginal>(this);
  }

  /**
   * Removes the row's controls: empties {@link Setting.controlEl} and {@link Setting.components}, drops the error
   * element and removes the `is-invalid` class, as Obsidian does.
   *
   * @returns This setting, for chaining.
   */
  public clear(): this {
    this.controlEl.empty();
    this.components = [];
    this.errorEl = null;
    this.settingEl.removeClass('is-invalid');
    return this;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Setting.prototype, 'constructor__')`.
   *
   * @param _containerEl - The element the row was created in.
   */
  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Makes the whole row act as a button: adds the `mod-action` and `tappable` classes and runs `callback` when the
   * row is clicked.
   *
   * @param callback - Called when the row is clicked.
   * @returns This setting, for chaining.
   */
  public setAction(callback: () => void): this {
    this.settingEl.addClass('mod-action', 'tappable');
    this.setRowClick(callback);
    return this;
  }

  /**
   * Adds one or more CSS classes to the row's element. As in Obsidian, the string is split on spaces first, so a
   * multi-class string adds every class rather than throwing, and empty parts are dropped.
   *
   * @param cls - The class name, or several separated by spaces.
   * @returns This setting, for chaining.
   */
  public setClass(cls: string): this {
    this.settingEl.addClass(...cls.split(' ').filter(Boolean));
    return this;
  }

  /**
   * Sets the row's description, replacing the content of {@link Setting.descEl} with the text or the fragment.
   *
   * @param desc - The description, as text or as a fragment.
   * @returns This setting, for chaining.
   */
  public setDesc(desc: DocumentFragment | string): this {
    this.descEl.setText(desc);
    return this;
  }

  /**
   * Disables or enables the row: records {@link Setting.disabled}, toggles the `is-disabled` class on
   * {@link Setting.settingEl}, and disables or enables every component in {@link Setting.components}.
   *
   * @param disabled - Whether the row is disabled.
   * @returns This setting, for chaining.
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    this.settingEl.classList.toggle('is-disabled', disabled);
    for (const component of this.components) {
      component.setDisabled(disabled);
    }
    return this;
  }

  /**
   * Shows a persistent validation error below the setting and adds the `is-invalid` class to the row. An empty
   * string or `null` hides the error element and removes the class. As in Obsidian, the element is created once, in
   * {@link Setting.controlEl}, and is then kept and re-shown rather than detached — so {@link Setting.errorEl} stays
   * set until {@link Setting.clear} drops it.
   *
   * @param message - The error message, or an empty string or `null` to clear it.
   * @returns This setting, for chaining.
   */
  public setErrorMessage(message: null | string): this {
    if (message) {
      this.errorEl ??= this.controlEl.createDiv('setting-item-error');
      this.errorEl.setText(message);
      this.errorEl.show();
      this.settingEl.addClass('is-invalid');
    } else {
      this.errorEl?.hide();
      this.settingEl.removeClass('is-invalid');
    }
    return this;
  }

  /**
   * Styles the row as a section heading, by adding the `setting-item-heading` class.
   *
   * @returns This setting, for chaining.
   */
  public setHeading(): this {
    this.settingEl.classList.add('setting-item-heading');
    return this;
  }

  /**
   * Sets the row's icon, shown before the info area. As in Obsidian, {@link Setting.iconEl} is created on the first
   * call only, as a `setting-item-icon` div prepended to {@link Setting.settingEl}, and a `null` or empty id empties
   * that element rather than removing it — so the element stays set once a first call has made it.
   *
   * Obsidian renders the icon into that element; the mock only records its id in the element's `data-icon` attribute,
   * as it does for the chevron {@link Setting.setNavigable} adds. Emptying therefore drops the attribute as well as
   * the element's children.
   *
   * @param icon - The icon id, or `null` to empty the icon element.
   * @returns This setting, for chaining.
   */
  public setIcon(icon: IconNameOriginal | null): this {
    this.iconEl ??= this.settingEl.createDiv({ cls: 'setting-item-icon', prepend: true });

    if (icon) {
      this.iconEl.dataset['icon'] = icon;
    } else {
      this.iconEl.empty();
      delete this.iconEl.dataset['icon'];
    }

    return this;
  }

  /**
   * Sets the row's name, replacing the content of {@link Setting.nameEl} with the text or the fragment.
   *
   * @param name - The name, as text or as a fragment.
   * @returns This setting, for chaining.
   */
  public setName(name: DocumentFragment | string): this {
    this.nameEl.setText(name);
    return this;
  }

  /**
   * Makes the row navigable: adds the `mod-navigable` and `tappable` classes, appends a chevron to
   * {@link Setting.controlEl}, and runs `callback` when the row is clicked, as {@link Setting.setAction} does.
   *
   * Obsidian renders the chevron's icon; the mock only records its id in the element's `data-icon` attribute.
   *
   * @param callback - Called when the row is clicked.
   * @returns This setting, for chaining.
   */
  public setNavigable(callback: () => void): this {
    this.settingEl.addClass('mod-navigable', 'tappable');
    this.controlEl.createDiv('setting-item-chevron', (chevronEl) => {
      chevronEl.dataset['icon'] = 'lucide-chevron-right';
    });
    this.setRowClick(callback);
    return this;
  }

  /**
   * Hides the row's info area ({@link Setting.infoEl}), for a row that is all control.
   *
   * @returns This setting, for chaining.
   */
  public setNoInfo(): this {
    this.infoEl.hide();
    return this;
  }

  /**
   * Records the handler run when the row is clicked, in {@link Setting.rowClick}, attaching the listener the first
   * time only, as Obsidian does — so a later call replaces the handler rather than adding a second listener. A
   * disabled row and an event whose default was already prevented are both ignored.
   *
   * Unlike {@link Setting.setAction} and {@link Setting.setNavigable}, which are both built on it, this returns
   * nothing and so does not chain.
   *
   * @param callback - Called when the row is clicked.
   */
  public setRowClick(callback: () => void): void {
    if (!this.rowClick) {
      this.settingEl.addEventListener('click', (event) => {
        if (event.defaultPrevented || this.disabled) {
          return;
        }

        this.rowClick?.();
      });
    }

    this.rowClick = callback;
  }

  /**
   * Sets the row's tooltip. The mock stores it as the `aria-label` attribute of {@link Setting.nameEl} — the
   * element Obsidian tooltips — and ignores the options.
   *
   * @param tooltip - The tooltip text.
   * @param _options - How the tooltip is displayed.
   * @returns This setting, for chaining.
   */
  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.nameEl.setAttribute('aria-label', tooltip);
    return this;
  }

  /**
   * Shows or hides the setting.
   *
   * @param visible - Whether the setting should be visible.
   * @returns This setting, for chaining.
   */
  public setVisibility(visible: boolean): this {
    this.settingEl.toggle(visible);
    return this;
  }

  /**
   * Calls `callback` with this setting, to keep configuration in one chain.
   *
   * @param callback - Called with this setting.
   * @returns This setting, for chaining.
   */
  public then(callback: (setting: this) => unknown): this {
    callback(this);
    return this;
  }
}

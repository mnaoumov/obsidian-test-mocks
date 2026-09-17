/**
 * @file
 *
 * Mock of Obsidian's `ExtraButtonComponent`, the small icon button at the end of a setting row.
 */

import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

/**
 * Mock of Obsidian's `ExtraButtonComponent`.
 *
 * As in Obsidian, a click on {@link ExtraButtonComponent.extraSettingsEl}, or Enter or Space pressed on it, runs the
 * handler unless the button is disabled. {@link ExtraButtonComponent.simulateClick__} does the same without an event.
 */
export class ExtraButtonComponent extends BaseComponent {
  /**
   * The click handler registered with {@link ExtraButtonComponent.onClick}, if any.
   */
  public changeCallback?: () => unknown;

  /**
   * The element the icon button renders into.
   */
  public extraSettingsEl: HTMLElement;

  /**
   * Creates the button inside a container, focusable, with its click and keyboard listeners.
   *
   * @param containerEl - The element the button element is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = containerEl.createDiv({ attr: { tabIndex: 0 }, cls: 'clickable-icon extra-setting-button' });
    const self = strictProxy(this);
    this.extraSettingsEl.addEventListener('click', (event) => {
      event.preventDefault();
      self.simulateClick__();
    });
    this.extraSettingsEl.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      self.simulateClick__();
    });
    self.constructor2__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates an extra button, spyable via `vi.spyOn(ExtraButtonComponent, 'create__')`.
   *
   * @param containerEl - The element the button element is appended to.
   * @returns The new extra button.
   */
  public static create__(containerEl: HTMLElement): ExtraButtonComponent {
    return new ExtraButtonComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ExtraButtonComponent` as this mock. The numbered subclass variant
   * of `fromOriginalType__`.
   *
   * @param value - The value typed as the original `ExtraButtonComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: ExtraButtonComponentOriginal): ExtraButtonComponent {
    return strictProxy(value, ExtraButtonComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ExtraButtonComponent` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `ExtraButtonComponent`.
   */
  public asOriginalType2__(): ExtraButtonComponentOriginal {
    return strictProxy<ExtraButtonComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ExtraButtonComponent.prototype, 'constructor2__')`.
   *
   * @param _containerEl - The container the button was created in.
   */
  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Sets the handler run when the button is clicked, replacing any previous one.
   *
   * @param callback - The click handler.
   * @returns This button, for chaining.
   */
  public onClick(callback: () => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Enables or disables the button. A disabled button gets the `is-disabled` class, leaves the tab order, and ignores
   * clicks.
   *
   * @param disabled - Whether the button is disabled.
   * @returns This button, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    this.extraSettingsEl.toggleClass('is-disabled', disabled);
    this.extraSettingsEl.setAttr('tabindex', disabled ? null : 0);
    return this;
  }

  /**
   * Sets the button's icon, by id from Obsidian's built-in or added icons. Obsidian renders the icon; the mock only
   * records its id in the element's `data-icon` attribute.
   *
   * @param icon - The icon id.
   * @returns This button, for chaining.
   */
  public setIcon(icon: string): this {
    this.extraSettingsEl.dataset['icon'] = icon;
    return this;
  }

  /**
   * Sets the button's tooltip. The mock writes it to the `aria-label` attribute.
   *
   * @param tooltip - The tooltip text.
   * @returns This button, for chaining.
   */
  public setTooltip(tooltip: string): this {
    this.extraSettingsEl.setAttribute('aria-label', tooltip);
    return this;
  }

  /**
   * Mock-only: simulates a click by calling the handler set with {@link ExtraButtonComponent.onClick}, if any, unless
   * the button is disabled.
   */
  public simulateClick__(): void {
    if (this.disabled) {
      return;
    }
    this.changeCallback?.();
  }
}

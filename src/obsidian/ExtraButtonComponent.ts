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
 * The click handler is not attached to the element: a test fires it with
 * {@link ExtraButtonComponent.simulateClick__}.
 */
export class ExtraButtonComponent extends BaseComponent {
  /**
   * The element the icon button renders into.
   */
  public extraSettingsEl: HTMLElement;
  private clickHandler?: () => unknown;

  /**
   * Creates the button inside a container.
   *
   * @param containerEl - The element the button element is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = containerEl.createDiv();
    const self = strictProxy(this);
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
   * Sets the handler run when the button is clicked. The mock stores it, replacing any previous one, and runs it
   * only from {@link ExtraButtonComponent.simulateClick__}.
   *
   * @param callback - The click handler.
   * @returns This button, for chaining.
   */
  public onClick(callback: () => unknown): this {
    this.clickHandler = callback;
    return this;
  }

  /**
   * Enables or disables the button. The mock only records the state in `disabled`; a disabled button still runs
   * its handler from {@link ExtraButtonComponent.simulateClick__}.
   *
   * @param disabled - Whether the button is disabled.
   * @returns This button, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    this.disabled = disabled;
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
   * Mock-only: simulates a click by calling the handler set with {@link ExtraButtonComponent.onClick}, if any.
   */
  public simulateClick__(): void {
    this.clickHandler?.();
  }
}

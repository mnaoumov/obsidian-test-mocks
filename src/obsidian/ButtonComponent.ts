/**
 * @file
 *
 * Mock of Obsidian's `ButtonComponent`, a button control for settings and modals.
 */

import type {
  ButtonComponent as ButtonComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

/**
 * Mock of Obsidian's `ButtonComponent`.
 *
 * The button element is really created in the container, and styling calls toggle the same CSS classes Obsidian
 * uses. The click handler is not attached to the element: a test fires it with
 * {@link ButtonComponent.simulateClick__}.
 */
export class ButtonComponent extends BaseComponent {
  /**
   * The `<button>` element the component renders.
   */
  public buttonEl: HTMLButtonElement;
  private clickHandler?: (event: MouseEvent) => unknown;

  /**
   * Creates a button inside a container.
   *
   * @param containerEl - The element the `<button>` is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.buttonEl = containerEl.createEl('button');
    const self = strictProxy(this);
    self.constructor2__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a button, spyable via `vi.spyOn(ButtonComponent, 'create__')`.
   *
   * @param containerEl - The element the `<button>` is appended to.
   * @returns The new button.
   */
  public static create__(containerEl: HTMLElement): ButtonComponent {
    return new ButtonComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ButtonComponent` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `ButtonComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: ButtonComponentOriginal): ButtonComponent {
    return strictProxy(value, ButtonComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ButtonComponent` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `ButtonComponent`.
   */
  public asOriginalType2__(): ButtonComponentOriginal {
    return strictProxy<ButtonComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ButtonComponent.prototype, 'constructor2__')`.
   *
   * @param _containerEl - The container the button was created in.
   */
  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Sets the handler run when the button is clicked. The mock stores it, replacing any previous one, and runs it
   * only from {@link ButtonComponent.simulateClick__}.
   *
   * @param callback - The click handler.
   * @returns This button, for chaining.
   */
  public onClick(callback: (event: MouseEvent) => unknown): this {
    this.clickHandler = callback;
    return this;
  }

  /**
   * Removes the call-to-action styling (the `mod-cta` class).
   *
   * @returns This button, for chaining.
   */
  public removeCta(): this {
    this.buttonEl.removeClass('mod-cta');
    return this;
  }

  /**
   * Removes the destructive styling (the `mod-destructive` class).
   *
   * @returns This button, for chaining.
   */
  public removeDestructive(): this {
    this.buttonEl.removeClass('mod-destructive');
    return this;
  }

  /**
   * Sets the button's label.
   *
   * @param name - The label text, written to the element's `textContent`.
   * @returns This button, for chaining.
   */
  public setButtonText(name: string): this {
    this.buttonEl.textContent = name;
    return this;
  }

  /**
   * Adds a CSS class to the button element.
   *
   * @param cls - The class to add.
   * @returns This button, for chaining.
   */
  public setClass(cls: string): this {
    this.buttonEl.addClass(cls);
    return this;
  }

  /**
   * Styles the button as the call to action, by adding the `mod-cta` class.
   *
   * @returns This button, for chaining.
   */
  public setCta(): this {
    this.buttonEl.addClass('mod-cta');
    return this;
  }

  /**
   * Styles the button as destructive, for actions that delete data or are hard to undo, by adding the
   * `mod-destructive` class.
   *
   * @returns This button, for chaining.
   */
  public setDestructive(): this {
    this.buttonEl.addClass('mod-destructive');
    return this;
  }

  /**
   * Sets the button's icon. Obsidian renders the icon; the mock only records its id in the element's
   * `data-icon` attribute.
   *
   * @param icon - The icon id.
   * @returns This button, for chaining.
   */
  public setIcon(icon: string): this {
    this.buttonEl.dataset['icon'] = icon;
    return this;
  }

  /**
   * Sets the button's tooltip. The mock writes it to the `aria-label` attribute and ignores the options.
   *
   * @param tooltip - The tooltip text.
   * @param _options - Tooltip placement and behavior options.
   * @returns This button, for chaining.
   */
  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.buttonEl.setAttribute('aria-label', tooltip);
    return this;
  }

  /**
   * Styles the button as a warning, by adding the `mod-warning` class. Obsidian deprecates it in favor of
   * {@link ButtonComponent.setDestructive}.
   *
   * @returns This button, for chaining.
   */
  public setWarning(): this {
    this.buttonEl.addClass('mod-warning');
    return this;
  }

  /**
   * Mock-only: simulates a click by calling the handler set with {@link ButtonComponent.onClick}, if any, with a
   * synthetic `click` event.
   */
  public simulateClick__(): void {
    this.clickHandler?.(new Event('click') as MouseEvent);
  }
}

/**
 * @file
 *
 * Mock of Obsidian's `ConfirmationButton`, a button inside a `ConfirmationModal`.
 */

import type { ConfirmationButton as ConfirmationButtonOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ButtonComponent } from './ButtonComponent.ts';

/**
 * Mock of Obsidian's `ConfirmationButton`, the button type `ConfirmationModal.addButton` creates.
 *
 * The placement and focus modifiers have no effect in the mock.
 */
export class ConfirmationButton extends ButtonComponent {
  /**
   * Creates a confirmation button. Obsidian's constructor is private; buttons come from
   * `ConfirmationModal.addButton`.
   *
   * @param containerEl - The element the `<button>` is appended to.
   */
  protected constructor(containerEl: HTMLElement) {
    super(containerEl);
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a confirmation button, spyable via `vi.spyOn(ConfirmationButton, 'create2__')`.
   * The numbered subclass variant of `create__`.
   *
   * @param containerEl - The element the `<button>` is appended to.
   * @returns The new confirmation button.
   */
  public static create2__(containerEl: HTMLElement): ConfirmationButton {
    return new ConfirmationButton(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ConfirmationButton` as this mock. The numbered subclass variant
   * of `fromOriginalType__`.
   *
   * @param value - The value typed as the original `ConfirmationButton`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ConfirmationButtonOriginal): ConfirmationButton {
    return strictProxy(value, ConfirmationButton);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ConfirmationButton` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `ConfirmationButton`.
   */
  public asOriginalType3__(): ConfirmationButtonOriginal {
    return strictProxy<ConfirmationButtonOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ConfirmationButton.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The container the button was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Sets the handler run when the button is clicked; same as {@link ButtonComponent.onClick}.
   *
   * @param handler - The click handler.
   * @returns This button, for chaining.
   */
  public override onClick(handler: (event: MouseEvent) => unknown): this {
    return super.onClick(handler);
  }

  /**
   * Styles the button as the dialog's dismissal action. A no-op in the mock.
   *
   * @returns This button, for chaining.
   */
  public setCancel(): this {
    return this;
  }

  /**
   * Marks the button as the focus target when the modal opens; the last one marked wins. A no-op in the mock.
   *
   * @returns This button, for chaining.
   */
  public setInitialFocus(): this {
    return this;
  }

  /**
   * Places the button apart from the main button group, for a tertiary action. A no-op in the mock.
   *
   * @returns This button, for chaining.
   */
  public setSecondary(): this {
    return this;
  }
}

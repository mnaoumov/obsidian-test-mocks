/**
 * @file
 *
 * Mock of Obsidian's `ConfirmationModal`, a modal with a row of action buttons.
 */

import type {
  ConfirmationButton as ConfirmationButtonOriginal,
  ConfirmationModal as ConfirmationModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ConfirmationButton } from './ConfirmationButton.ts';
import { Modal } from './Modal.ts';

/**
 * Mock of Obsidian's `ConfirmationModal`.
 *
 * Buttons are created in {@link ConfirmationModal.buttonContainerEl} and checkboxes in the content element, so a
 * test can find and drive them; the cancel button is not rendered.
 */
export class ConfirmationModal extends Modal {
  /**
   * The element holding the modal's action buttons.
   */
  public buttonContainerEl: HTMLElement;

  /**
   * Creates the modal and its button container.
   *
   * @param app - The app the modal belongs to.
   */
  public constructor(app: App) {
    super(app);
    this.buttonContainerEl = this.modalEl.createDiv();
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a confirmation modal, spyable via `vi.spyOn(ConfirmationModal, 'create2__')`. The
   * numbered subclass variant of `create__`.
   *
   * @param app - The app the modal belongs to.
   * @returns The new confirmation modal.
   */
  public static create2__(app: App): ConfirmationModal {
    return new ConfirmationModal(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ConfirmationModal` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `ConfirmationModal`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: ConfirmationModalOriginal): ConfirmationModal {
    return strictProxy(value, ConfirmationModal);
  }

  /**
   * Adds an action button to the button container.
   *
   * @param callback - Called immediately with the new button, to configure it.
   * @returns This modal, for chaining.
   */
  public addButton(callback: (button: ConfirmationButtonOriginal) => unknown): this {
    const button = ConfirmationButton.create2__(this.buttonContainerEl);
    callback(button.asOriginalType3__());
    return this;
  }

  /**
   * Adds a button that closes the modal. A no-op in the mock: no button is created.
   *
   * @param _text - The button label.
   * @returns This modal, for chaining.
   */
  public addCancelButton(_text?: string): this {
    return this;
  }

  /**
   * Adds a labeled checkbox to the modal's content.
   *
   * @param label - The checkbox label; the mock sets it as the input's `aria-label`.
   * @param callback - Called with the checked state whenever the checkbox changes.
   * @returns This modal, for chaining.
   */
  public addCheckbox(label: string, callback: (value: boolean) => unknown): this {
    const checkbox = this.contentEl.createEl('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', label);
    checkbox.addEventListener('change', () => {
      callback(checkbox.checked);
    });
    return this;
  }

  /**
   * Adds a CSS class to the modal's container element.
   *
   * @param cls - The class to add.
   * @returns This modal, for chaining.
   */
  public addClass(cls: string): this {
    this.containerEl.addClass(cls);
    return this;
  }

  /**
   * Mock-only: views this mock as Obsidian's `ConfirmationModal` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `ConfirmationModal`.
   */
  public asOriginalType2__(): ConfirmationModalOriginal {
    return strictProxy<ConfirmationModalOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ConfirmationModal.prototype, 'constructor2__')`.
   *
   * @param _app - The app the modal was created with.
   */
  public constructor2__(_app: App): void {
    noop();
  }
}

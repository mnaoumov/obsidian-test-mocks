/**
 * @file
 *
 * Mock of Obsidian's `Modal`, a dialog shown over the workspace.
 */

import type { Modal as ModalOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Scope } from './Scope.ts';

/**
 * Mock of Obsidian's `Modal` dialog.
 *
 * The modal's elements are built detached from the document. {@link Modal.open} calls {@link Modal.onOpen} and then
 * closes the modal from a zero-delay `setTimeout`, which gives a test one tick to interact with its content.
 */
export class Modal {
  /**
   * The app instance the modal belongs to.
   */
  public app: App;

  /**
   * The dimmed background element behind the modal.
   */
  public bgEl: HTMLElement;

  /**
   * The outermost element holding the background and the modal.
   */
  public containerEl: HTMLElement;

  /**
   * The element subclasses render the modal's body into.
   */
  public contentEl: HTMLElement;

  /**
   * The header element holding the title.
   */
  public headerEl: HTMLDivElement;

  /**
   * The modal dialog element itself.
   */
  public modalEl: HTMLElement;

  /**
   * The keymap scope active while the modal is open.
   */
  public scope: Scope;

  /**
   * Whether the text selection active before opening is restored when the modal closes.
   */
  public shouldRestoreSelection = true;

  /**
   * The element holding the modal's title.
   */
  public titleEl: HTMLElement;

  private closeCallback: (() => unknown) | null = null;

  /**
   * Creates the modal and its elements, without opening it.
   *
   * @param app - The app instance.
   */
  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv('modal-container');
    this.bgEl = this.containerEl.createDiv('modal-bg');
    this.modalEl = this.containerEl.createDiv('modal');
    this.headerEl = this.modalEl.createDiv('modal-header');
    this.titleEl = this.headerEl.createDiv('modal-title');
    this.contentEl = this.modalEl.createDiv('modal-content');
    this.scope = Scope.create__();
    const self = strictProxy(this);
    self.constructor__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a modal, spyable via `vi.spyOn(Modal, 'create__')`.
   *
   * @param app - The app instance.
   * @returns The new modal.
   */
  public static create__(app: App): Modal {
    return new Modal(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Modal` as this mock.
   *
   * @param value - The value typed as the original `Modal`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: ModalOriginal): Modal {
    return strictProxy(value, Modal);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Modal` type.
   *
   * @returns The same object, typed as the original `Modal`.
   */
  public asOriginalType__(): ModalOriginal {
    return strictProxy<ModalOriginal>(this);
  }

  /**
   * Hides the modal. The mock calls {@link Modal.onClose} and then the callback set by
   * {@link Modal.setCloseCallback}, if any.
   */
  public close(): void {
    this.onClose();
    this.closeCallback?.();
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Modal.prototype, 'constructor__')`.
   *
   * @param _app - The app the modal was created with.
   */
  public constructor__(_app: App): void {
    noop();
  }

  /**
   * Called when the modal closes; subclasses override it to clean up. A no-op by default.
   */
  public onClose(): void {
    noop();
  }

  /**
   * Called when the modal opens; subclasses override it to render content. A no-op by default.
   */
  public onOpen(): void {
    noop();
  }

  /**
   * Shows the modal on the active window. The mock calls {@link Modal.onOpen} synchronously and schedules
   * {@link Modal.close} with a zero-delay `setTimeout`.
   */
  public open(): void {
    this.onOpen();
    // Use setTimeout so tests can intercept (e.g. simulate button clicks)
    // before the modal auto-closes.
    setTimeout(() => {
      this.close();
    }, 0);
  }

  /**
   * Sets a callback to run after the modal closes, replacing any previous one.
   *
   * @param callback - The callback to run on close.
   * @returns This modal, for chaining.
   */
  public setCloseCallback(callback: () => unknown): this {
    this.closeCallback = callback;
    return this;
  }

  /**
   * Sets the modal's body content. A string replaces the text of {@link Modal.contentEl}; a fragment is appended
   * to it.
   *
   * @param content - The content, as text or as a fragment.
   * @returns This modal, for chaining.
   */
  public setContent(content: DocumentFragment | string): this {
    if (typeof content === 'string') {
      this.contentEl.textContent = content;
    } else {
      this.contentEl.append(content);
    }
    return this;
  }

  /**
   * Sets the modal's title text.
   *
   * @param title - The title.
   * @returns This modal, for chaining.
   */
  public setTitle(title: string): this {
    this.titleEl.textContent = title;
    return this;
  }
}

import type {
  ConfirmationButton as ConfirmationButtonOriginal,
  ConfirmationModal as ConfirmationModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ConfirmationButton } from './ConfirmationButton.ts';
import { Modal } from './Modal.ts';

export class ConfirmationModal extends Modal {
  public buttonContainerEl: HTMLElement;

  public constructor(app: App) {
    super(app);
    this.buttonContainerEl = this.modalEl.createDiv();
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  public static create2__(app: App): ConfirmationModal {
    return new ConfirmationModal(app);
  }

  public static fromOriginalType2__(value: ConfirmationModalOriginal): ConfirmationModal {
    return strictProxy(value, ConfirmationModal);
  }

  public addButton(cb: (btn: ConfirmationButtonOriginal) => unknown): this {
    const btn = ConfirmationButton.create2__(this.buttonContainerEl);
    cb(btn.asOriginalType3__());
    return this;
  }

  public addCancelButton(_text?: string): this {
    return this;
  }

  public addCheckbox(label: string, cb: (value: boolean) => unknown): this {
    const checkbox = this.contentEl.createEl('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', label);
    checkbox.addEventListener('change', () => {
      cb(checkbox.checked);
    });
    return this;
  }

  public addClass(cls: string): this {
    this.containerEl.addClass(cls);
    return this;
  }

  public asOriginalType2__(): ConfirmationModalOriginal {
    return strictProxy<ConfirmationModalOriginal>(this);
  }

  public constructor2__(_app: App): void {
    noop();
  }
}

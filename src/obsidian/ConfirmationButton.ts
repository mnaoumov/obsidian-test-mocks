import type { ConfirmationButton as ConfirmationButtonOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ButtonComponent } from './ButtonComponent.ts';

export class ConfirmationButton extends ButtonComponent {
  protected constructor(containerEl: HTMLElement) {
    super(containerEl);
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  public static create2__(containerEl: HTMLElement): ConfirmationButton {
    return new ConfirmationButton(containerEl);
  }

  public static fromOriginalType3__(value: ConfirmationButtonOriginal): ConfirmationButton {
    return strictProxy(value, ConfirmationButton);
  }

  public asOriginalType3__(): ConfirmationButtonOriginal {
    return strictProxy<ConfirmationButtonOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override onClick(handler: (evt: MouseEvent) => unknown): this {
    return super.onClick(handler);
  }

  public setCancel(): this {
    return this;
  }

  public setInitialFocus(): this {
    return this;
  }

  public setSecondary(): this {
    return this;
  }
}

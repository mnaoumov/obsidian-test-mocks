import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  public extraSettingsEl: HTMLElement;
  private clickHandler?: () => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = createDiv();
    const self = strictMock(this);
    self.constructor2__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ExtraButtonComponent {
    return new ExtraButtonComponent(containerEl);
  }

  public static fromOriginalType2__(value: ExtraButtonComponentOriginal): ExtraButtonComponent {
    return createMockOfUnsafe<ExtraButtonComponent>(value);
  }

  public asOriginalType2__(): ExtraButtonComponentOriginal {
    return createMockOfUnsafe<ExtraButtonComponentOriginal>(this);
  }

  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }

  public onClick(callback: () => unknown): this {
    this.clickHandler = callback;
    return this;
  }

  public override setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  public setIcon(icon: string): this {
    this.extraSettingsEl.dataset['icon'] = icon;
    return this;
  }

  public setTooltip(tooltip: string): this {
    this.extraSettingsEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public simulateClick__(): void {
    this.clickHandler?.();
  }
}

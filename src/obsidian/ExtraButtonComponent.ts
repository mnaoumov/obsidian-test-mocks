import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  public extraSettingsEl: HTMLElement;
  private clickHandler?: () => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = createDiv();
    this.constructor__(_containerEl);
  }

  public static create__(containerEl: HTMLElement): ExtraButtonComponent {
    return strictMock(new ExtraButtonComponent(containerEl));
  }

  public override asOriginalType__(): ExtraButtonComponentOriginal {
    return castTo<ExtraButtonComponentOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
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

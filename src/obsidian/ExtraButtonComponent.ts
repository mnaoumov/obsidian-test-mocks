import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  public extraSettingsEl: HTMLElement;
  private clickHandler?: () => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = createDiv();
    const self = strictProxyForce(this);
    self.constructor2__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ExtraButtonComponent {
    return new ExtraButtonComponent(containerEl);
  }

  public static fromOriginalType2__(value: ExtraButtonComponentOriginal): ExtraButtonComponent {
    return strictProxyForce(value, ExtraButtonComponent);
  }

  public asOriginalType2__(): ExtraButtonComponentOriginal {
    return strictProxyForce<ExtraButtonComponentOriginal>(this);
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

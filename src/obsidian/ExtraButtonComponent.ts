import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  private static insideCreate__ = false;
  public extraSettingsEl: HTMLElement;
  private clickHandler?: () => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.extraSettingsEl = createDiv();
    if (new.target === ExtraButtonComponent && !ExtraButtonComponent.insideCreate__) {
      return ExtraButtonComponent.create__(_containerEl);
    }
  }

  public static create__(containerEl: HTMLElement): ExtraButtonComponent {
    ExtraButtonComponent.insideCreate__ = true;
    const instance = strictMock(new ExtraButtonComponent(containerEl));
    ExtraButtonComponent.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): ExtraButtonComponentOriginal {
    return castTo<ExtraButtonComponentOriginal>(this);
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

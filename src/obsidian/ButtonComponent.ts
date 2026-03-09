import type {
  ButtonComponent as ButtonComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ButtonComponent extends BaseComponent {
  public buttonEl: HTMLButtonElement;
  private clickHandler?: (evt: MouseEvent) => unknown;

  public constructor(containerEl: HTMLElement) {
    super();
    this.buttonEl = containerEl.createEl('button');
    const self = strictMock(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): ButtonComponent {
    return new ButtonComponent(containerEl);
  }

  public override asOriginalType__(): ButtonComponentOriginal {
    return castTo<ButtonComponentOriginal>(this);
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  public onClick(callback: (evt: MouseEvent) => unknown): this {
    this.clickHandler = callback;
    return this;
  }

  public removeCta(): this {
    this.buttonEl.removeClass('mod-cta');
    return this;
  }

  public setButtonText(name: string): this {
    this.buttonEl.textContent = name;
    return this;
  }

  public setClass(cls: string): this {
    this.buttonEl.addClass(cls);
    return this;
  }

  public setCta(): this {
    this.buttonEl.addClass('mod-cta');
    return this;
  }

  public setIcon(icon: string): this {
    this.buttonEl.dataset['icon'] = icon;
    return this;
  }

  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.buttonEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public setWarning(): this {
    this.buttonEl.addClass('mod-warning');
    return this;
  }

  public simulateClick__(): void {
    this.clickHandler?.(new Event('click') as MouseEvent);
  }
}

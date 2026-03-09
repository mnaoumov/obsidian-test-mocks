import type {
  ButtonComponent as ButtonComponentOriginal,
  TooltipOptions
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ButtonComponent extends BaseComponent {
  /** Mock-only. Tracks all created instances for test assertions. Not part of the Obsidian API. */
  public static instances__: ButtonComponent[] = [];
  public buttonEl: HTMLButtonElement;
  private clickHandler?: (evt: MouseEvent) => unknown;

  public constructor(containerEl: HTMLElement) {
    super();
    this.buttonEl = containerEl.createEl('button');
    ButtonComponent.instances__.push(this);
    return strictMock(this);
  }

  public override asOriginalType__(): ButtonComponentOriginal {
    return castTo<ButtonComponentOriginal>(this);
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

  public setTooltip(tooltip: string, _options?: TooltipOptions): this {
    this.buttonEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public setWarning(): this {
    this.buttonEl.addClass('mod-warning');
    return this;
  }

  /** Mock-only. Simulates a button click by invoking the registered click handler. Not part of the Obsidian API. */
  public simulateClick__(): void {
    this.clickHandler?.(new Event('click') as MouseEvent);
  }
}

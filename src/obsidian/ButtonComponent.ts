import type {
  ButtonComponent as RealButtonComponent,
  TooltipOptions
} from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ButtonComponent extends BaseComponent {
  /** @deprecated Mock-only. Tracks all created instances for test assertions. Not part of the Obsidian API. */
  public static instances: ButtonComponent[] = [];
  public buttonEl: HTMLButtonElement;
  private clickHandler?: (evt: MouseEvent) => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.buttonEl = createEl('button');
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Initializing mock-only tracking field.
    ButtonComponent.instances.push(this);
    const mock = strictMock(this);
    ButtonComponent.constructor__(mock, _containerEl);
    return mock;
  }

  public static override constructor__(_instance: BaseComponent, ..._args: unknown[]): void {
    // Spy hook.
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

  /** @deprecated Mock-only. Simulates a button click by invoking the registered click handler. Not part of the Obsidian API. */
  public simulateClick(): void {
    this.clickHandler?.(new Event('click') as MouseEvent);
  }

  public override asReal__(): RealButtonComponent {
    return strictCastTo<RealButtonComponent>(this);
  }
}

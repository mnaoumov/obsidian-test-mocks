import type { TooltipOptions } from 'obsidian';

import { BaseComponent } from './BaseComponent.ts';

export class ButtonComponent extends BaseComponent {
  /** @deprecated Mock-only. Tracks all created instances for test assertions. Not part of the Obsidian API. */
  public static instances: ButtonComponent[] = [];
  public buttonEl: HTMLButtonElement = createEl('button');
  private clickHandler?: (evt: MouseEvent) => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Initializing mock-only tracking field.
    ButtonComponent.instances.push(this);
    ButtonComponent.__constructor(this, _containerEl);
  }

  public static override __constructor(_instance: BaseComponent, ..._args: unknown[]): void {
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
}

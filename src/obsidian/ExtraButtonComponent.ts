import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  public extraSettingsEl: HTMLElement = createDiv();
  private clickHandler?: () => unknown;

  public constructor(_containerEl: HTMLElement) {
    super();
    ExtraButtonComponent.__constructor(this, _containerEl);
  }

  public static override __constructor(_instance: BaseComponent, ..._args: unknown[]): void {
    // Spy hook.
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

  /** @deprecated Mock-only. Simulates a click by invoking the registered click handler. Not part of the Obsidian API. */
  public simulateClick(): void {
    this.clickHandler?.();
  }
}

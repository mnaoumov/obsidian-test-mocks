import { noop } from '../internal/Noop.ts';
import { BaseComponent } from './BaseComponent.ts';

export class ExtraButtonComponent extends BaseComponent {
  public extraSettingsEl: HTMLElement = createDiv();

  public onClick(_callback: () => unknown): this {
    return this;
  }

  public override setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  public setIcon(_icon: string): this {
    return this;
  }

  public setTooltip(_tooltip: string): this {
    return this;
  }
}

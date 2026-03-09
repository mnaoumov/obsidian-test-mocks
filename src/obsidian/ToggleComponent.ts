import type {
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ToggleComponent extends ValueComponent<boolean> {
  public toggleEl: HTMLElement;

  public override get inputEl(): HTMLElement {
    return this.toggleEl;
  }

  private _onChange: ((value: boolean) => unknown) | null = null;
  private _value = false;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.toggleEl = createDiv();
    return strictMock(this);
  }

  public override asOriginalType__(): ToggleComponentOriginal {
    return castTo<ToggleComponentOriginal>(this);
  }

  public override getValue(): boolean {
    return this._value;
  }

  public onChange(callback: (value: boolean) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onClick(): void {
    this._value = !this._value;
    this._onChange?.(this._value);
  }

  public setTooltip(tooltip: string, _options?: TooltipOptions): this {
    this.toggleEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public override setValue(value: boolean): this {
    this._value = value;
    this._onChange?.(value);
    return this;
  }
}

import type { SliderComponent as SliderComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

const DEFAULT_MAX = 100;

export class SliderComponent extends ValueComponent<number> {
  public sliderEl: HTMLInputElement;

  public override get inputEl(): HTMLInputElement {
    return this.sliderEl;
  }

  private _max = DEFAULT_MAX;
  private _min = 0;
  private _onChange: ((value: number) => unknown) | null = null;
  private _step: 'any' | number = 1;
  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.sliderEl = createEl('input');
    this.sliderEl.type = 'range';
    return strictMock(this);
  }

  public override asOriginalType__(): SliderComponentOriginal {
    return castTo<SliderComponentOriginal>(this);
  }

  public override getValue(): number {
    return this._value;
  }

  public getValuePretty(): string {
    return String(this._value);
  }

  public onChange(callback: (value: number) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public setDynamicTooltip(): this {
    return this;
  }

  public setInstant(_instant: boolean): this {
    return this;
  }

  public setLimits(min: null | number, max: null | number, step: 'any' | number): this {
    this._min = min ?? 0;
    this._max = max ?? DEFAULT_MAX;
    this._step = step;
    this.sliderEl.setAttribute('min', String(this._min));
    this.sliderEl.setAttribute('max', String(this._max));
    this.sliderEl.setAttribute('step', String(this._step));
    return this;
  }

  public override setValue(value: number): this {
    this._value = value;
    this._onChange?.(value);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Noop UI operation.
  public showTooltip(): void {
  }
}

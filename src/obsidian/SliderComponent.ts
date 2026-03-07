import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class SliderComponent extends ValueComponent<number> {
  public sliderEl: HTMLInputElement;

  public override get inputEl(): HTMLInputElement {
    return this.sliderEl;
  }

  private _max = 100;
  private _min = 0;
  private _onChange: ((value: number) => unknown) | null = null;
  private _step: 'any' | number = 1;
  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Calling mock-only @deprecated ValueComponent constructor.
    super();
    this.sliderEl = createEl('input');
    this.sliderEl.type = 'range';
    SliderComponent.__constructor(this, _containerEl);
    return strictMock(this);
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
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
    this._max = max ?? 100;
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

  public showTooltip(): void {
  }
}

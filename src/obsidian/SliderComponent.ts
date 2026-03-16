import type { SliderComponent as SliderComponentOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { ValueComponent } from './ValueComponent.ts';

const DEFAULT_MAX = 100;

export class SliderComponent extends ValueComponent<number> {
  public sliderEl: HTMLInputElement;

  private _onChange: ((value: number) => unknown) | null = null;
  private max = DEFAULT_MAX;
  private min = 0;
  private step: 'any' | number = 1;
  private value = 0;

  public constructor(_containerEl: HTMLElement) {
    super();
    this.sliderEl = createEl('input');
    this.sliderEl.type = 'range';
    const self = createMockOf(this);
    self.constructor3__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): SliderComponent {
    return new SliderComponent(containerEl);
  }

  public static fromOriginalType3__(value: SliderComponentOriginal): SliderComponent {
    return createMockOfUnsafe<SliderComponent>(value);
  }

  public asOriginalType3__(): SliderComponentOriginal {
    return createMockOfUnsafe<SliderComponentOriginal>(this);
  }

  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  public override getValue(): number {
    return this.value;
  }

  public getValuePretty(): string {
    return String(this.value);
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
    this.min = min ?? 0;
    this.max = max ?? DEFAULT_MAX;
    this.step = step;
    this.sliderEl.setAttribute('min', String(this.min));
    this.sliderEl.setAttribute('max', String(this.max));
    this.sliderEl.setAttribute('step', String(this.step));
    return this;
  }

  public override setValue(value: number): this {
    this.value = value;
    this._onChange?.(value);
    return this;
  }

  public showTooltip(): void {
    noop();
  }
}

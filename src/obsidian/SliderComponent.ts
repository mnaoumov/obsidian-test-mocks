/**
 * @file
 *
 * Mock of Obsidian's `SliderComponent`, a range input bound to a numeric value.
 */

import type { SliderComponent as SliderComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

const DEFAULT_MAX = 100;

/**
 * Mock of Obsidian's `SliderComponent`.
 *
 * The value and limits are kept in memory; limits are mirrored onto {@link SliderComponent.sliderEl}'s attributes,
 * and {@link SliderComponent.setValue} invokes the change callback.
 */
export class SliderComponent extends ValueComponent<number> {
  /**
   * The underlying `<input type="range">` element.
   */
  public sliderEl: HTMLInputElement;

  private _onChange: ((value: number) => unknown) | null = null;
  private max = DEFAULT_MAX;
  private min = 0;
  private step: 'any' | number = 1;
  private value = 0;

  /**
   * Creates a slider and appends its range input to the container.
   *
   * @param containerEl - The element to create the slider in.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.sliderEl = containerEl.createEl('input');
    this.sliderEl.type = 'range';
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a slider, spyable via `vi.spyOn(SliderComponent, 'create__')`.
   *
   * @param containerEl - The element to create the slider in.
   * @returns The new slider.
   */
  public static create__(containerEl: HTMLElement): SliderComponent {
    return new SliderComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SliderComponent` as this mock.
   *
   * @param value - The value typed as the original `SliderComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: SliderComponentOriginal): SliderComponent {
    return strictProxy(value, SliderComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SliderComponent` type.
   *
   * @returns The same object, typed as the original `SliderComponent`.
   */
  public asOriginalType3__(): SliderComponentOriginal {
    return strictProxy<SliderComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SliderComponent.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The container the slider was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Gets the slider's current value.
   *
   * @returns The value, `0` until one is set.
   */
  public override getValue(): number {
    return this.value;
  }

  /**
   * Gets the value formatted for display.
   *
   * @returns The value as a string; the mock ignores any custom display format.
   */
  public getValuePretty(): string {
    return String(this.value);
  }

  /**
   * Registers the callback invoked when the value changes, replacing any previous one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: number) => unknown): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Sets a custom formatter for the value shown inline next to the slider. A no-op in the mock.
   *
   * @param _format - Formats a value for display.
   * @returns This component, for chaining.
   */
  public setDisplayFormat(_format: (value: number) => string): this {
    return this;
  }

  /**
   * Shows the value in a tooltip while dragging. Obsidian deprecates it, since the value is now always shown inline.
   * A no-op in the mock.
   *
   * @returns This component, for chaining.
   */
  public setDynamicTooltip(): this {
    return this;
  }

  /**
   * Sets whether the value updates while the slider is being dragged. A no-op in the mock.
   *
   * @param _instant - Whether to update the value during dragging.
   * @returns This component, for chaining.
   */
  public setInstant(_instant: boolean): this {
    return this;
  }

  /**
   * Sets the slider's range and step, and mirrors them onto the input's `min`, `max` and `step` attributes.
   *
   * @param min - The minimum value; `null` means `0`.
   * @param max - The maximum value; `null` means `100`.
   * @param step - The step size, or `'any'` for no stepping.
   * @returns This component, for chaining.
   */
  public setLimits(min: null | number, max: null | number, step: 'any' | number): this {
    this.min = min ?? 0;
    this.max = max ?? DEFAULT_MAX;
    this.step = step;
    this.sliderEl.setAttribute('min', String(this.min));
    this.sliderEl.setAttribute('max', String(this.max));
    this.sliderEl.setAttribute('step', String(this.step));
    return this;
  }

  /**
   * Sets the slider's value. The mock stores it without clamping to the limits and invokes the change callback.
   *
   * @param value - The new value.
   * @returns This component, for chaining.
   */
  public override setValue(value: number): this {
    this.value = value;
    this._onChange?.(value);
    return this;
  }
}

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
const DEFAULT_STEP = 1;
const HALF = 0.5;
const JSDOM_UNTOUCHED_VALUE = '50';
const PRETTY_FRACTION_DIGITS = 2;

/**
 * Mock of Obsidian's `SliderComponent`.
 *
 * As in Obsidian, the value lives in {@link SliderComponent.sliderEl}, and the limits are its `min`, `max` and `step`
 * attributes. A browser keeps a range input's value inside those limits and on a step; jsdom does not, so the mock
 * applies the same rules itself whenever it reads the value. {@link SliderComponent.setValue} calls the change
 * callback only when the value actually changes, and the element's `input` and `change` events call it as Obsidian
 * does, depending on {@link SliderComponent.instant}.
 */
export class SliderComponent extends ValueComponent<number> {
  /**
   * The callback registered with {@link SliderComponent.onChange}, or `null`.
   */
  public changeCallback: ((value: number) => unknown) | null = null;

  /**
   * The formatter set with {@link SliderComponent.setDisplayFormat}, or `null`.
   */
  public displayFormat: ((value: number) => string) | null = null;

  /**
   * Whether the change callback runs on every `input` event rather than only on `change`.
   */
  public instant = false;

  /**
   * The underlying `<input type="range">` element.
   */
  public sliderEl: HTMLInputElement;

  private hasExplicitValue = false;

  /**
   * Creates a slider and appends its range input to the container.
   *
   * @param containerEl - The element to create the slider in.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.sliderEl = containerEl.createEl('input');
    this.sliderEl.type = 'range';
    this.sliderEl.addClass('slider');
    const self = strictProxy(this);
    this.sliderEl.addEventListener('input', () => {
      self.hasExplicitValue = true;
      if (self.instant) {
        self.changeCallback?.(self.getValue());
      }
    });
    this.sliderEl.addEventListener('change', () => {
      self.hasExplicitValue = true;
      if (!self.instant) {
        self.changeCallback?.(self.getValue());
      }
    });
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
   * Gets the slider's current value, the way a browser reports a range input's `valueAsNumber`.
   *
   * @returns The element's value clamped to the limits and rounded to the nearest step; the middle of the range
   * until a value is set.
   */
  public override getValue(): number {
    const min = parseAttribute(this.sliderEl.getAttribute('min'), 0);
    const max = Math.max(min, parseAttribute(this.sliderEl.getAttribute('max'), DEFAULT_MAX));
    const midpoint = min + (max - min) * HALF;
    // Jsdom reports an untouched range input as `50` whatever its limits, where a browser reports the midpoint.
    const isUntouched = !this.hasExplicitValue && this.sliderEl.value === JSDOM_UNTOUCHED_VALUE;
    const rawValue = isUntouched ? NaN : Number.parseFloat(this.sliderEl.value);
    const value = Math.min(max, Math.max(min, Number.isFinite(rawValue) ? rawValue : midpoint));
    const stepAttribute = this.sliderEl.getAttribute('step');
    if (stepAttribute?.toLowerCase() === 'any') {
      return value;
    }
    const parsedStep = parseAttribute(stepAttribute, DEFAULT_STEP);
    const step = parsedStep > 0 ? parsedStep : DEFAULT_STEP;
    let stepped = min + Math.round((value - min) / step) * step;
    if (stepped > max) {
      stepped = min + Math.floor((max - min) / step) * step;
    }
    return stepped;
  }

  /**
   * Gets the value formatted for display.
   *
   * @returns The value passed through the display format when one is set; otherwise the value with two decimals
   * when the step is `any` or below 1, or as a plain number.
   */
  public getValuePretty(): string {
    const value = this.getValue();
    if (this.displayFormat) {
      return this.displayFormat(value);
    }
    const step = this.sliderEl.step;
    return step === 'any' || Number.parseFloat(step) < 1 ? value.toFixed(PRETTY_FRACTION_DIGITS) : value.toString();
  }

  /**
   * Registers the callback invoked when the value changes, replacing any previous one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: number) => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Disables or enables the slider and its range input.
   *
   * @param disabled - Whether the slider is disabled.
   * @returns This component, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    this.sliderEl.disabled = disabled;
    return this;
  }

  /**
   * Sets a custom formatter for the value shown next to the slider, used by {@link SliderComponent.getValuePretty}.
   *
   * @param format - Formats a value for display.
   * @returns This component, for chaining.
   */
  public setDisplayFormat(format: (value: number) => string): this {
    this.displayFormat = format;
    return this;
  }

  /**
   * Shows the value in a tooltip while dragging. Obsidian deprecates it, since the value is now always shown inline,
   * and its implementation does nothing either.
   *
   * @returns This component, for chaining.
   */
  public setDynamicTooltip(): this {
    return this;
  }

  /**
   * Sets whether the change callback runs while the slider is dragged (`input` events) rather than on release
   * (`change` events).
   *
   * @param instant - Whether to call the change callback during dragging.
   * @returns This component, for chaining.
   */
  public setInstant(instant: boolean): this {
    this.instant = instant;
    return this;
  }

  /**
   * Sets the slider's range and step as the input's `min`, `max` and `step` attributes. The value is re-read against
   * the new limits, as a browser does.
   *
   * @param min - The minimum value; `null` means `0`.
   * @param max - The maximum value; `null` means `100`.
   * @param step - The step size, or `'any'` for no stepping.
   * @returns This component, for chaining.
   */
  public setLimits(min: null | number, max: null | number, step: 'any' | number): this {
    this.sliderEl.setAttrs({ max, min, step });
    return this;
  }

  /**
   * Sets the slider's value. When the element's value changes, it is stored and the change callback is called with
   * `value` as given; an unchanged value does nothing. The value read back is kept within the limits and on a step.
   *
   * @param value - The new value.
   * @returns This component, for chaining.
   */
  public override setValue(value: number): this {
    if (this.getValue() !== value) {
      this.hasExplicitValue = true;
      this.sliderEl.value = String(value);
      this.changeCallback?.(value);
    }
    return this;
  }
}

function parseAttribute(value: null | string, fallback: number): number {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

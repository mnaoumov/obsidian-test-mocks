/**
 * @file
 *
 * Mock of Obsidian's `ColorComponent`, a color picker control.
 */

import type {
  ColorComponent as ColorComponentOriginal,
  HSL as HSLOriginal,
  RGB as RGBOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { ValueComponent } from './ValueComponent.ts';

/* eslint-disable no-magic-numbers -- Color conversion constants. */
const RGB_MAX = 255;
const HUE_MAX = 360;
const PERCENT_MAX = 100;
const HSL_HALF = 0.5;
const HSL_SEGMENT_COUNT = 6;
const HSL_OFFSET_GREEN = 2;
const HSL_OFFSET_BLUE = 4;
const ONE_SIXTH = 1 / 6;
const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;
const HEX_RADIX = 16;
const HEX_PAD_LENGTH = 2;
/* eslint-enable no-magic-numbers -- Re-enable after constants. */

const HEX_COLOR_REG_EXP = /^#?(?<r>[\da-f]{2})(?<g>[\da-f]{2})(?<b>[\da-f]{2})(?:[\da-f]{2})?$/i;

/**
 * Mock of Obsidian's `ColorComponent`.
 *
 * As in Obsidian, the value lives in {@link ColorComponent.colorPickerEl}, a real `<input type="color">`, so it reads
 * as a lowercase six-digit hex string such as `#ff8800` and starts as `#000000`. The RGB and HSL accessors convert
 * to and from that string with Obsidian's own formulas: HSL uses an integer hue from 0 to 360 and integer saturation
 * and lightness from 0 to 100.
 */
export class ColorComponent extends ValueComponent<string> {
  /**
   * The callback registered with {@link ColorComponent.onChange}, if any.
   */
  public changeCallback?: (value: string) => unknown;

  /**
   * The `<input type="color">` element the component renders.
   */
  public colorPickerEl: HTMLInputElement;

  /**
   * Creates a color picker inside a container. Its `change` event calls the change callback, as in Obsidian.
   *
   * @param containerEl - The element the color input is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.colorPickerEl = containerEl.createEl('input');
    this.colorPickerEl.type = 'color';
    const self = strictProxy(this);
    this.colorPickerEl.addEventListener('change', () => {
      self.changeCallback?.(self.getValue());
    });
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a color picker, spyable via `vi.spyOn(ColorComponent, 'create__')`.
   *
   * @param containerEl - The element the color input is appended to.
   * @returns The new color picker.
   */
  public static create__(containerEl: HTMLElement): ColorComponent {
    return new ColorComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ColorComponent` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `ColorComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ColorComponentOriginal): ColorComponent {
    return strictProxy(value, ColorComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ColorComponent` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `ColorComponent`.
   */
  public asOriginalType3__(): ColorComponentOriginal {
    return strictProxy<ColorComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ColorComponent.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The container the color picker was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Gets the current color.
   *
   * @returns The color input's value, a lowercase hex string; `#000000` until a color is set.
   */
  public override getValue(): string {
    return this.colorPickerEl.value;
  }

  /**
   * Gets the current color as HSL.
   *
   * @returns The color's integer hue (0-360), saturation (0-100) and lightness (0-100).
   */
  public getValueHsl(): HSLOriginal {
    const { b, g, r } = this.getValueRgb();
    const rn = r / RGB_MAX;
    const gn = g / RGB_MAX;
    const bn = b / RGB_MAX;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / HSL_OFFSET_GREEN;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = d / (l > HSL_HALF ? HSL_OFFSET_GREEN - max - min : max + min);
      if (max === rn) {
        h = (gn - bn) / d + (gn < bn ? HSL_SEGMENT_COUNT : 0);
      } else if (max === gn) {
        h = (bn - rn) / d + HSL_OFFSET_GREEN;
      } else {
        h = (rn - gn) / d + HSL_OFFSET_BLUE;
      }
      h /= HSL_SEGMENT_COUNT;
    }
    return {
      h: Math.round(HUE_MAX * h),
      l: Math.round(PERCENT_MAX * l),
      s: Math.round(PERCENT_MAX * s)
    };
  }

  /**
   * Gets the current color as RGB.
   *
   * @returns The red, green and blue channels, each 0-255; black when the value is not a hex color.
   */
  public getValueRgb(): RGBOriginal {
    const groups = HEX_COLOR_REG_EXP.exec(this.getValue())?.groups;
    return groups
      ? {
        b: Number.parseInt(ensureNonNullable(groups['b']), HEX_RADIX),
        g: Number.parseInt(ensureNonNullable(groups['g']), HEX_RADIX),
        r: Number.parseInt(ensureNonNullable(groups['r']), HEX_RADIX)
      }
      : { b: 0, g: 0, r: 0 };
  }

  /**
   * Sets the handler run when the color changes, replacing any previous one.
   *
   * @param callback - Receives the new hex value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: string) => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Disables or enables the color picker and its input.
   *
   * @param disabled - Whether the color picker is disabled.
   * @returns This component, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    this.colorPickerEl.disabled = disabled;
    return this;
  }

  /**
   * Sets the current color. When it differs from the input's value, it is written to the input and the change
   * handler is called with the value the input then holds; an unchanged value does nothing.
   *
   * @param value - The color as a hex string such as `#ff8800`.
   * @returns This component, for chaining.
   */
  public override setValue(value: string): this {
    if (this.colorPickerEl.value !== value) {
      this.colorPickerEl.value = value;
      this.changeCallback?.(this.getValue());
    }
    return this;
  }

  /**
   * Sets the current color from HSL, converting it to RGB and on through {@link ColorComponent.setValueRgb}.
   *
   * @param hsl - The color, with hue 0-360 and saturation and lightness 0-100.
   * @returns This component, for chaining.
   */
  public setValueHsl(hsl: HSLOriginal): this {
    return this.setValueRgb(hslToRgb(hsl));
  }

  /**
   * Sets the current color from RGB, converting it to a hex string through {@link ColorComponent.setValue}.
   *
   * @param rgb - The color, with each channel an integer 0-255.
   * @returns This component, for chaining.
   */
  public setValueRgb(rgb: RGBOriginal): this {
    const hex = `#${[rgb.r, rgb.g, rgb.b].map((c) => c.toString(HEX_RADIX).padStart(HEX_PAD_LENGTH, '0')).join('')}`;
    return this.setValue(hex);
  }
}

function hslToRgb(hsl: HSLOriginal): RGBOriginal {
  const h = hsl.h / HUE_MAX;
  const s = hsl.s / PERCENT_MAX;
  const l = hsl.l / PERCENT_MAX;
  if (s === 0) {
    const v = Math.round(l * RGB_MAX);
    return { b: v, g: v, r: v };
  }
  const q = l < HSL_HALF ? l * (1 + s) : l + s - l * s;
  const p = HSL_OFFSET_GREEN * l - q;
  return {
    b: Math.round(hue2rgb(p, q, h - ONE_THIRD) * RGB_MAX),
    g: Math.round(hue2rgb(p, q, h) * RGB_MAX),
    r: Math.round(hue2rgb(p, q, h + ONE_THIRD) * RGB_MAX)
  };
}

function hue2rgb(p: number, q: number, t: number): number {
  let tn = t;
  if (tn < 0) {
    tn += 1;
  }
  if (tn > 1) {
    tn -= 1;
  }
  if (tn < ONE_SIXTH) {
    return p + (q - p) * HSL_SEGMENT_COUNT * tn;
  }
  if (tn < HSL_HALF) {
    return q;
  }
  return tn < TWO_THIRDS ? p + (q - p) * (TWO_THIRDS - tn) * HSL_SEGMENT_COUNT : p;
}

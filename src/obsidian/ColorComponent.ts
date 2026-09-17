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
import { ValueComponent } from './ValueComponent.ts';

/* eslint-disable no-magic-numbers -- Color conversion constants. */
const RGB_MAX = 255;
const HSL_HALF = 0.5;
const HSL_SEGMENT_COUNT = 6;
const HSL_OFFSET_GREEN = 2;
const HSL_OFFSET_BLUE = 4;
const ONE_SIXTH = 1 / 6;
const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;
const HEX_RADIX = 16;
const HEX_PAD_LENGTH = 2;
const HEX_SLICE_R_END = 2;
const HEX_SLICE_G_END = 4;
const HEX_SLICE_B_END = 6;
/* eslint-enable no-magic-numbers -- Re-enable after constants. */

/**
 * Mock of Obsidian's `ColorComponent`.
 *
 * The value is a six-digit hex string such as `#ff8800`, kept in memory and mirrored into a real
 * `<input type="color">`. RGB and HSL accessors convert to and from that hex string.
 */
export class ColorComponent extends ValueComponent<string> {
  /**
   * The `<input type="color">` element the component renders.
   */
  public colorPickerEl: HTMLInputElement;

  private _onChange?: (value: string) => unknown;
  private value = '';

  /**
   * Creates a color picker inside a container, with an empty value.
   *
   * @param containerEl - The element the color input is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.colorPickerEl = containerEl.createEl('input');
    this.colorPickerEl.type = 'color';
    const self = strictProxy(this);
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
   * @returns The hex string last set, or `''` when no color has been set.
   */
  public override getValue(): string {
    return this.value;
  }

  /**
   * Gets the current color as HSL.
   *
   * @returns The color's hue, saturation and lightness. Obsidian's `HSL` uses a 0-360 hue and 0-100 saturation and
   * lightness; the mock returns all three as fractions between 0 and 1.
   */
  public getValueHsl(): HSLOriginal {
    const { b, g, r } = this.getValueRgb();
    const rn = r / RGB_MAX;
    const gn = g / RGB_MAX;
    const bn = b / RGB_MAX;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / HSL_OFFSET_GREEN;
    if (max === min) {
      return { h: 0, l, s: 0 };
    }
    const d = max - min;
    const s = d / (l > HSL_HALF ? HSL_OFFSET_GREEN - max - min : max + min);
    let h: number;
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? HSL_SEGMENT_COUNT : 0)) / HSL_SEGMENT_COUNT;
    } else if (max === gn) {
      h = ((bn - rn) / d + HSL_OFFSET_GREEN) / HSL_SEGMENT_COUNT;
    } else {
      h = ((rn - gn) / d + HSL_OFFSET_BLUE) / HSL_SEGMENT_COUNT;
    }
    return { h, l, s };
  }

  /**
   * Gets the current color as RGB.
   *
   * @returns The red, green and blue channels, each 0-255, parsed from the hex value; a channel that does not parse
   * is `0`.
   */
  public getValueRgb(): RGBOriginal {
    const hex = this.value.replace('#', '');
    const r = Number.parseInt(hex.slice(0, HEX_SLICE_R_END), HEX_RADIX) || 0;
    const g = Number.parseInt(hex.slice(HEX_SLICE_R_END, HEX_SLICE_G_END), HEX_RADIX) || 0;
    const b = Number.parseInt(hex.slice(HEX_SLICE_G_END, HEX_SLICE_B_END), HEX_RADIX) || 0;
    return { b, g, r };
  }

  /**
   * Sets the handler run when the color changes, replacing any previous one.
   *
   * @param callback - Receives the new hex value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Sets the current color. The mock also writes it to the color input and calls the change handler.
   *
   * @param value - The color as a hex string such as `#ff8800`.
   * @returns This component, for chaining.
   */
  public override setValue(value: string): this {
    this.value = value;
    this.colorPickerEl.value = value;
    this._onChange?.(value);
    return this;
  }

  /**
   * Sets the current color from HSL, converting it to hex through {@link ColorComponent.setValueRgb}.
   *
   * @param hsl - The color. The mock reads hue, saturation and lightness as fractions between 0 and 1, not
   * Obsidian's 0-360 and 0-100 ranges.
   * @returns This component, for chaining.
   */
  public setValueHsl(hsl: HSLOriginal): this {
    const { b, g, r } = hslToRgb(hsl);
    return this.setValueRgb({ b, g, r });
  }

  /**
   * Sets the current color from RGB, converting it to a hex string through {@link ColorComponent.setValue}.
   *
   * @param rgb - The color, with each channel 0-255; channels are rounded.
   * @returns This component, for chaining.
   */
  public setValueRgb(rgb: RGBOriginal): this {
    const hex = `#${[rgb.r, rgb.g, rgb.b].map((c) => Math.round(c).toString(HEX_RADIX).padStart(HEX_PAD_LENGTH, '0')).join('')}`;
    return this.setValue(hex);
  }
}

function hslToRgb(hsl: HSLOriginal): RGBOriginal {
  const { h, l, s } = hsl;
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

import type {
  ColorComponent as ColorComponentOriginal,
  HSL,
  RGB
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
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

export class ColorComponent extends ValueComponent<string> {
  public colorPickerEl: HTMLInputElement;

  public override get inputEl(): HTMLInputElement {
    return this.colorPickerEl;
  }

  private _onChange?: (value: string) => unknown;
  private _value = '';

  public constructor(containerEl: HTMLElement) {
    super();
    this.colorPickerEl = containerEl.createEl('input');
    this.colorPickerEl.type = 'color';
    return strictMock(this);
  }

  public override asOriginalType__(): ColorComponentOriginal {
    return castTo<ColorComponentOriginal>(this);
  }

  public override getValue(): string {
    return this._value;
  }

  public getValueHsl(): HSL {
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
    const s = l > HSL_HALF ? d / (HSL_OFFSET_GREEN - max - min) : d / (max + min);
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

  public getValueRgb(): RGB {
    const hex = this._value.replace('#', '');
    const r = parseInt(hex.slice(0, HEX_SLICE_R_END), HEX_RADIX) || 0;
    const g = parseInt(hex.slice(HEX_SLICE_R_END, HEX_SLICE_G_END), HEX_RADIX) || 0;
    const b = parseInt(hex.slice(HEX_SLICE_G_END, HEX_SLICE_B_END), HEX_RADIX) || 0;
    return { b, g, r };
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public override setValue(value: string): this {
    this._value = value;
    this.colorPickerEl.value = value;
    this._onChange?.(value);
    return this;
  }

  public setValueHsl(hsl: HSL): this {
    const { b, g, r } = hslToRgb(hsl);
    return this.setValueRgb({ b, g, r });
  }

  public setValueRgb(rgb: RGB): this {
    const hex = `#${[rgb.r, rgb.g, rgb.b].map((c) => Math.round(c).toString(HEX_RADIX).padStart(HEX_PAD_LENGTH, '0')).join('')}`;
    return this.setValue(hex);
  }
}

function hslToRgb(hsl: HSL): RGB {
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
  if (tn < TWO_THIRDS) {
    return p + (q - p) * (TWO_THIRDS - tn) * HSL_SEGMENT_COUNT;
  }
  return p;
}

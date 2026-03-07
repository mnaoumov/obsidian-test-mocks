import type {
  HSL,
  RGB
} from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ColorComponent extends ValueComponent<string> {
  public colorPickerEl: HTMLInputElement;

  public override get inputEl(): HTMLInputElement {
    return this.colorPickerEl;
  }

  private _onChange?: (value: string) => unknown;
  private _value = '';

  public constructor(_containerEl: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Calling mock-only @deprecated ValueComponent constructor.
    super();
    this.colorPickerEl = createEl('input');
    this.colorPickerEl.type = 'color';
    ColorComponent.__constructor(this, _containerEl);
    return strictMock(this);
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override getValue(): string {
    return this._value;
  }

  public getValueHsl(): HSL {
    const { b, g, r } = this.getValueRgb();
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) {
      return { h: 0, l, s: 0 };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    } else if (max === gn) {
      h = ((bn - rn) / d + 2) / 6;
    } else {
      h = ((rn - gn) / d + 4) / 6;
    }
    return { h, l, s };
  }

  public getValueRgb(): RGB {
    const hex = this._value.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
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
    const hex = '#' + [rgb.r, rgb.g, rgb.b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
    return this.setValue(hex);
  }
}

function hslToRgb(hsl: HSL): RGB {
  const { h, l, s } = hsl;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { b: v, g: v, r: v };
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t;
    if (tn < 0) { tn += 1; }
    if (tn > 1) { tn -= 1; }
    if (tn < 1 / 6) { return p + (q - p) * 6 * tn; }
    if (tn < 1 / 2) { return q; }
    if (tn < 2 / 3) { return p + (q - p) * (2 / 3 - tn) * 6; }
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
  };
}

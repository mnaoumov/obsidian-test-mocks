import type { ColorComponent as ColorComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { ColorComponent } from './ColorComponent.ts';

describe('ColorComponent', () => {
  function createColor(): ColorComponent {
    const containerEl = createDiv();
    return ColorComponent.create__(containerEl);
  }

  it('should create an instance via create__', () => {
    const color = createColor();
    expect(color).toBeInstanceOf(ColorComponent);
  });

  it('should create colorPickerEl as child of containerEl', () => {
    const containerEl = createDiv();
    const color = ColorComponent.create__(containerEl);
    expect(color.colorPickerEl.parentElement).toBe(containerEl);
  });

  it('should set colorPickerEl type to color', () => {
    const color = createColor();
    expect(color.colorPickerEl.type).toBe('color');
  });

  it('should throw when accessing an unmocked property', () => {
    const color = createColor();
    const record = ensureGenericObject(color);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in ColorComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const color = createColor();
      const original: ColorComponentOriginal = color.asOriginalType3__();
      expect(original).toBe(color);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const color = createColor();
      const mock = ColorComponent.fromOriginalType3__(color.asOriginalType3__());
      expect(mock).toBe(color);
    });
  });

  describe('getValue', () => {
    it('should return black initially, as a color input does', () => {
      const color = createColor();
      expect(color.getValue()).toBe('#000000');
    });

    it('should return the value after setValue', () => {
      const color = createColor();
      color.setValue('#ff0000');
      expect(color.getValue()).toBe('#ff0000');
    });

    it('should read a value written directly to the element', () => {
      const color = createColor();
      color.colorPickerEl.value = '#123456';
      expect(color.getValue()).toBe('#123456');
    });
  });

  describe('setValue', () => {
    it('should set the value and update colorPickerEl', () => {
      const color = createColor();
      color.setValue('#00ff00');
      expect(color.getValue()).toBe('#00ff00');
      expect(color.colorPickerEl.value).toBe('#00ff00');
    });

    it('should invoke onChange callback when the value changes', () => {
      const color = createColor();
      const callback = vi.fn();
      color.onChange(callback);
      color.setValue('#0000ff');
      expect(callback).toHaveBeenCalledWith('#0000ff');
      expect(color.changeCallback).toBe(callback);
    });

    it('should not invoke onChange callback when the value is unchanged', () => {
      const color = createColor();
      color.setValue('#0000ff');
      const callback = vi.fn();
      color.onChange(callback);
      color.setValue('#0000ff');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should pass the value the input holds to the callback', () => {
      const color = createColor();
      const callback = vi.fn();
      color.onChange(callback);
      color.setValue('#FF0000');
      expect(callback).toHaveBeenCalledWith('#ff0000');
    });

    it('should return this for chaining', () => {
      const color = createColor();
      expect(color.setValue('#000000')).toBe(color);
    });

    it('should not throw if no onChange callback is registered', () => {
      const color = createColor();
      expect(() => {
        color.setValue('#ffffff');
      }).not.toThrow();
    });
  });

  describe('change event', () => {
    it('should invoke onChange callback with the current value', () => {
      const color = createColor();
      const callback = vi.fn();
      color.onChange(callback);
      color.colorPickerEl.value = '#abcdef';
      color.colorPickerEl.dispatchEvent(new Event('change'));
      expect(callback).toHaveBeenCalledWith('#abcdef');
    });

    it('should not throw without a callback', () => {
      const color = createColor();
      expect(() => {
        color.colorPickerEl.dispatchEvent(new Event('change'));
      }).not.toThrow();
    });
  });

  describe('setDisabled', () => {
    it('should disable the input and return this', () => {
      const color = createColor();
      expect(color.setDisabled(true)).toBe(color);
      expect(color.disabled).toBe(true);
      expect(color.colorPickerEl.disabled).toBe(true);
    });
  });

  describe('onChange', () => {
    it('should return this for chaining', () => {
      const color = createColor();
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Testing chaining with noop callback.
      expect(color.onChange(() => {})).toBe(color);
    });
  });

  describe('getValueRgb', () => {
    it.each([
      ['#ff0000', { b: 0, g: 0, r: 255 }],
      ['#00ff00', { b: 0, g: 255, r: 0 }],
      ['#0000ff', { b: 255, g: 0, r: 0 }],
      ['#123456', { b: 86, g: 52, r: 18 }]
    ])('should parse %s', (hex, rgb) => {
      const color = createColor();
      color.setValue(hex);
      expect(color.getValueRgb()).toEqual(rgb);
    });

    it('should return black for a value that is not a hex color', () => {
      const color = createColor();
      Object.defineProperty(color.colorPickerEl, 'value', { configurable: true, value: 'red' });
      expect(color.getValueRgb()).toEqual({ b: 0, g: 0, r: 0 });
    });
  });

  describe('setValueRgb', () => {
    it('should convert RGB to hex and set value', () => {
      const color = createColor();
      const FULL_CHANNEL = 255;
      color.setValueRgb({ b: 0, g: 0, r: FULL_CHANNEL });
      expect(color.getValue()).toBe('#ff0000');
    });

    it('should return this for chaining', () => {
      const color = createColor();
      expect(color.setValueRgb({ b: 0, g: 0, r: 0 })).toBe(color);
    });
  });

  describe('getValueHsl', () => {
    it.each([
      ['#000000', { h: 0, l: 0, s: 0 }],
      ['#808080', { h: 0, l: 50, s: 0 }],
      ['#ff0000', { h: 0, l: 50, s: 100 }],
      ['#00ff00', { h: 120, l: 50, s: 100 }],
      ['#0000ff', { h: 240, l: 50, s: 100 }],
      ['#ff8080', { h: 0, l: 75, s: 100 }],
      ['#ff0080', { h: 330, l: 50, s: 100 }],
      ['#400000', { h: 0, l: 13, s: 100 }]
    ])('should convert %s to integer HSL', (hex, hsl) => {
      const color = createColor();
      color.setValue(hex);
      expect(color.getValueHsl()).toEqual(hsl);
    });
  });

  describe('setValueHsl', () => {
    it.each([
      [{ h: 0, l: 50, s: 0 }, '#808080'],
      [{ h: 0, l: 50, s: 100 }, '#ff0000'],
      [{ h: 180, l: 50, s: 100 }, '#00ffff'],
      [{ h: 0, l: 75, s: 50 }, '#df9f9f'],
      [{ h: 270, l: 50, s: 100 }, '#7f00ff'],
      [{ h: 60, l: 50, s: 100 }, '#ffff00'],
      [{ h: 0, l: 25, s: 100 }, '#800000']
    ])('should convert %j to %s', (hsl, hex) => {
      const color = createColor();
      color.setValueHsl(hsl);
      expect(color.getValue()).toBe(hex);
    });

    it('should round-trip integer HSL', () => {
      const color = createColor();
      const hsl = { h: 120, l: 50, s: 100 };
      color.setValueHsl(hsl);
      expect(color.getValueHsl()).toEqual(hsl);
    });

    it('should return this for chaining', () => {
      const color = createColor();
      expect(color.setValueHsl({ h: 0, l: 0, s: 0 })).toBe(color);
    });
  });
});

import type { ColorComponent as ColorComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ColorComponent } from '../../src/obsidian/ColorComponent.ts';

describe('ColorComponent', () => {
  function createColor(): ColorComponent {
    const containerEl = createDiv();
    return ColorComponent.create__(containerEl);
  }

  it('should create an instance via create__', () => {
    const color = createColor();
    expect(color).toBeInstanceOf(ColorComponent);
  });

  it('should create colorPickerEl__ as child of containerEl', () => {
    const containerEl = createDiv();
    const color = ColorComponent.create__(containerEl);
    expect(color.colorPickerEl__.parentElement).toBe(containerEl);
  });

  it('should set colorPickerEl__ type to color', () => {
    const color = createColor();
    expect(color.colorPickerEl__.type).toBe('color');
  });

  it('should throw when accessing an unmocked property', () => {
    const color = createColor();
    const record = color as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in ColorComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const color = createColor();
      const original: ColorComponentOriginal = color.asOriginalType__();
      expect(original).toBe(color);
    });
  });

  describe('getValue', () => {
    it('should return empty string initially', () => {
      const color = createColor();
      expect(color.getValue()).toBe('');
    });

    it('should return the value after setValue', () => {
      const color = createColor();
      color.setValue('#ff0000');
      expect(color.getValue()).toBe('#ff0000');
    });
  });

  describe('setValue', () => {
    it('should set the value and update colorPickerEl__', () => {
      const color = createColor();
      color.setValue('#00ff00');
      expect(color.getValue()).toBe('#00ff00');
      expect(color.colorPickerEl__.value).toBe('#00ff00');
    });

    it('should invoke onChange callback', () => {
      const color = createColor();
      const cb = vi.fn();
      color.onChange(cb);
      color.setValue('#0000ff');
      expect(cb).toHaveBeenCalledWith('#0000ff');
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

  describe('onChange', () => {
    it('should return this for chaining', () => {
      const color = createColor();
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Testing chaining with noop callback.
      expect(color.onChange(() => {})).toBe(color);
    });
  });

  describe('getValueRgb', () => {
    it('should parse red hex to RGB', () => {
      const color = createColor();
      color.setValue('#ff0000');
      const rgb = color.getValueRgb();
      const FULL_RED = 255;
      expect(rgb.r).toBe(FULL_RED);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('should parse green hex to RGB', () => {
      const color = createColor();
      color.setValue('#00ff00');
      const rgb = color.getValueRgb();
      const FULL_GREEN = 255;
      expect(rgb.r).toBe(0);
      expect(rgb.g).toBe(FULL_GREEN);
      expect(rgb.b).toBe(0);
    });

    it('should parse blue hex to RGB', () => {
      const color = createColor();
      color.setValue('#0000ff');
      const rgb = color.getValueRgb();
      const FULL_BLUE = 255;
      expect(rgb.r).toBe(0);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(FULL_BLUE);
    });

    it('should handle empty value as black', () => {
      const color = createColor();
      const rgb = color.getValueRgb();
      expect(rgb.r).toBe(0);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
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
    it('should return zero HSL for black', () => {
      const color = createColor();
      color.setValue('#000000');
      const hsl = color.getValueHsl();
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(0);
    });

    it('should return achromatic HSL for gray', () => {
      const color = createColor();
      color.setValue('#808080');
      const hsl = color.getValueHsl();
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBeGreaterThan(0);
    });

    it('should return correct HSL for pure red', () => {
      const color = createColor();
      color.setValue('#ff0000');
      const hsl = color.getValueHsl();
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(1);
      const HALF = 0.5;
      expect(hsl.l).toBe(HALF);
    });

    it('should return correct HSL for pure green', () => {
      const color = createColor();
      color.setValue('#00ff00');
      const hsl = color.getValueHsl();
      // Green hue is at 120 degrees = 1/3
      const GREEN_HUE = 0.3333;
      expect(hsl.h).toBeCloseTo(GREEN_HUE);
      expect(hsl.s).toBe(1);
    });

    it('should return correct HSL for pure blue', () => {
      const color = createColor();
      color.setValue('#0000ff');
      const hsl = color.getValueHsl();
      // Blue hue is at 240 degrees = 2/3
      const BLUE_HUE = 0.6667;
      expect(hsl.h).toBeCloseTo(BLUE_HUE);
      expect(hsl.s).toBe(1);
    });

    it('should handle light colors with l > 0.5', () => {
      const color = createColor();
      // Light pink: rgb(255, 200, 200)
      color.setValue('#ffc8c8');
      const hsl = color.getValueHsl();
      const HALF = 0.5;
      expect(hsl.l).toBeGreaterThan(HALF);
    });

    it('should handle red-dominant color where green < blue', () => {
      const color = createColor();
      // Color where max=r but g < b, covering the gn < bn branch
      color.setValue('#ff0080');
      const hsl = color.getValueHsl();
      expect(hsl.h).toBeGreaterThan(0);
      expect(hsl.s).toBe(1);
    });
  });

  describe('setValueHsl', () => {
    it('should convert achromatic HSL to gray hex', () => {
      const color = createColor();
      const HALF = 0.5;
      color.setValueHsl({ h: 0, l: HALF, s: 0 });
      const rgb = color.getValueRgb();
      const GRAY = 128;
      expect(rgb.r).toBe(GRAY);
      expect(rgb.g).toBe(GRAY);
      expect(rgb.b).toBe(GRAY);
    });

    it('should round-trip through RGB for saturated colors', () => {
      const color = createColor();
      const HALF = 0.5;
      color.setValueHsl({ h: 0, l: HALF, s: 1 });
      const rgb = color.getValueRgb();
      const FULL_CHANNEL = 255;
      expect(rgb.r).toBe(FULL_CHANNEL);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
    });

    it('should return this for chaining', () => {
      const color = createColor();
      expect(color.setValueHsl({ h: 0, l: 0, s: 0 })).toBe(color);
    });

    it('should handle hue in different segments', () => {
      const color = createColor();
      // Cyan-ish: hue = 0.5 (180 degrees)
      const HALF = 0.5;
      color.setValueHsl({ h: HALF, l: HALF, s: 1 });
      const rgb = color.getValueRgb();
      expect(rgb.r).toBe(0);
      const FULL_CHANNEL = 255;
      expect(rgb.g).toBe(FULL_CHANNEL);
      expect(rgb.b).toBe(FULL_CHANNEL);
    });

    it('should handle light colors with l greater than half', () => {
      const color = createColor();
      const LIGHT = 0.75;
      const MEDIUM_SAT = 0.5;
      color.setValueHsl({ h: 0, l: LIGHT, s: MEDIUM_SAT });
      const rgb = color.getValueRgb();
      // Light pinkish color
      expect(rgb.r).toBeGreaterThan(rgb.g);
    });

    it('should handle hue in the blue-purple segment', () => {
      const color = createColor();
      // Purple: hue = 0.75 (270 degrees)
      const PURPLE_HUE = 0.75;
      const HALF = 0.5;
      color.setValueHsl({ h: PURPLE_HUE, l: HALF, s: 1 });
      const rgb = color.getValueRgb();
      // Purple has high blue and red
      const FULL_CHANNEL = 255;
      expect(rgb.b).toBe(FULL_CHANNEL);
    });

    it('should handle hue in the yellow segment', () => {
      const color = createColor();
      // Yellow: hue = 1/6 (60 degrees)
      const YELLOW_HUE = 0.1667;
      const HALF = 0.5;
      color.setValueHsl({ h: YELLOW_HUE, l: HALF, s: 1 });
      const rgb = color.getValueRgb();
      const FULL_CHANNEL = 255;
      expect(rgb.r).toBe(FULL_CHANNEL);
      expect(rgb.g).toBe(FULL_CHANNEL);
    });
  });
});

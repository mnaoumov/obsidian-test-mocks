import type { SliderComponent as SliderComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SliderComponent } from './SliderComponent.ts';

const VALUE_5 = 5;
const VALUE_8 = 8;
const VALUE_10 = 10;
const VALUE_15 = 15;
const VALUE_20 = 20;
const VALUE_50 = 50;
const VALUE_75 = 75;
const VALUE_150 = 150;
const MIN_10 = 10;
const MAX_200 = 200;
const STEP_4 = 4;
const STEP_5 = 5;
const HALF_STEP = 0.5;
const FRACTION = 3.25;

describe('SliderComponent', () => {
  it('should create an instance via create__', () => {
    const slider = SliderComponent.create__(createDiv());
    expect(slider).toBeInstanceOf(SliderComponent);
  });

  it('should have a slider input element', () => {
    const slider = SliderComponent.create__(createDiv());
    expect(slider.sliderEl.type).toBe('range');
    expect(slider.sliderEl.hasClass('slider')).toBe(true);
  });

  describe('getValue / setValue', () => {
    it('should default to the middle of the default range', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.getValue()).toBe(VALUE_50);
    });

    it('should default to the middle of the configured range', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, 1);
      expect(slider.getValue()).toBe(VALUE_5);
    });

    it('should set and get value', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_75);
      expect(slider.getValue()).toBe(VALUE_75);
      expect(slider.sliderEl.value).toBe(String(VALUE_75));
    });

    it('should call onChange callback when value changes', () => {
      const slider = SliderComponent.create__(createDiv());
      const callback = vi.fn();
      slider.onChange(callback);
      slider.setValue(VALUE_75);
      expect(callback).toHaveBeenCalledWith(VALUE_75);
    });

    it('should not call onChange callback when value is unchanged', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_75);
      const callback = vi.fn();
      slider.onChange(callback);
      slider.setValue(VALUE_75);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not throw when no onChange callback is set', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(() => {
        slider.setValue(VALUE_75);
      }).not.toThrow();
    });

    it('should clamp to the limits and pass the requested value to the callback', () => {
      const slider = SliderComponent.create__(createDiv());
      const callback = vi.fn();
      slider.onChange(callback);
      slider.setValue(VALUE_150);
      expect(slider.getValue()).toBe(VALUE_50 * 2);
      expect(callback).toHaveBeenCalledWith(VALUE_150);
      slider.setValue(-VALUE_5);
      expect(slider.getValue()).toBe(0);
    });

    it('should keep an untouched value at the default when set to it', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_50);
      slider.setLimits(0, VALUE_10, 1);
      expect(slider.getValue()).toBe(VALUE_5);
    });

    it('should re-read the value against new limits', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_75);
      slider.setLimits(0, VALUE_10, 1);
      expect(slider.getValue()).toBe(VALUE_10);
    });

    it('should treat an explicitly set 50 as a value, not as the untouched default', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, 1);
      slider.setValue(VALUE_50);
      expect(slider.getValue()).toBe(VALUE_10);
    });

    it('should round to the nearest step from the minimum', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(MIN_10, MAX_200, STEP_5);
      slider.setValue(VALUE_20 + 2);
      expect(slider.getValue()).toBe(VALUE_20);
    });

    it('should step down when rounding up would pass the maximum', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, STEP_4);
      slider.setValue(VALUE_10);
      expect(slider.getValue()).toBe(VALUE_8);
    });

    it('should not step when the step is any', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, 'any');
      slider.setValue(FRACTION);
      expect(slider.getValue()).toBe(FRACTION);
    });

    it('should fall back to a step of 1 for a non-positive step', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, 0);
      slider.setValue(FRACTION);
      expect(slider.getValue()).toBe(3);
    });

    it('should use the minimum as the maximum when the maximum is below it', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(VALUE_20, VALUE_10, 1);
      expect(slider.getValue()).toBe(VALUE_20);
    });

    it('should read back a value written directly to the element', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.sliderEl.value = String(VALUE_15);
      expect(slider.getValue()).toBe(VALUE_15);
    });
  });

  describe('element events', () => {
    it('should call the callback on change when not instant', () => {
      const slider = SliderComponent.create__(createDiv());
      const callback = vi.fn();
      slider.onChange(callback);
      slider.sliderEl.value = String(VALUE_50);
      slider.sliderEl.dispatchEvent(new Event('input'));
      expect(callback).not.toHaveBeenCalled();
      slider.sliderEl.dispatchEvent(new Event('change'));
      expect(callback).toHaveBeenCalledWith(VALUE_50);
    });

    it('should call the callback on input when instant', () => {
      const slider = SliderComponent.create__(createDiv());
      const callback = vi.fn();
      slider.setInstant(true).onChange(callback);
      slider.sliderEl.dispatchEvent(new Event('change'));
      expect(callback).not.toHaveBeenCalled();
      slider.sliderEl.dispatchEvent(new Event('input'));
      expect(callback).toHaveBeenCalledWith(VALUE_50);
    });

    it('should not throw on events without a callback', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(() => {
        slider.sliderEl.dispatchEvent(new Event('change'));
        slider.setInstant(true);
        slider.sliderEl.dispatchEvent(new Event('input'));
      }).not.toThrow();
    });
  });

  describe('getValuePretty', () => {
    it('should return an integer step value as a plain number', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_75);
      expect(slider.getValuePretty()).toBe(String(VALUE_75));
    });

    it('should use two decimals for a fractional step', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, 1, HALF_STEP);
      slider.setValue(HALF_STEP);
      expect(slider.getValuePretty()).toBe('0.50');
    });

    it('should use two decimals for step any', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(0, VALUE_10, 'any');
      slider.setValue(FRACTION);
      expect(slider.getValuePretty()).toBe('3.25');
    });

    it('should use the display format when one is set', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setDisplayFormat((value) => `${String(value)}%`);
      expect(slider.getValuePretty()).toBe('50%');
    });
  });

  describe('setLimits', () => {
    it('should set min, max, and step attributes', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(MIN_10, MAX_200, STEP_5);
      expect(slider.sliderEl.getAttribute('min')).toBe(String(MIN_10));
      expect(slider.sliderEl.getAttribute('max')).toBe(String(MAX_200));
      expect(slider.sliderEl.getAttribute('step')).toBe(String(STEP_5));
    });

    it('should remove min and max for null, leaving the default range', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(MIN_10, MAX_200, 1);
      slider.setLimits(null, null, 'any');
      expect(slider.sliderEl.hasAttribute('min')).toBe(false);
      expect(slider.sliderEl.hasAttribute('max')).toBe(false);
      expect(slider.sliderEl.getAttribute('step')).toBe('any');
      expect(slider.getValue()).toBe(VALUE_50);
    });

    it('should return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setLimits(0, VALUE_50, 1)).toBe(slider);
    });
  });

  describe('setDisabled', () => {
    it('should disable the input and return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setDisabled(true)).toBe(slider);
      expect(slider.disabled).toBe(true);
      expect(slider.sliderEl.disabled).toBe(true);
    });
  });

  describe('setDynamicTooltip', () => {
    it('should return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setDynamicTooltip()).toBe(slider);
    });
  });

  describe('setInstant', () => {
    it('should record the flag and return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setInstant(true)).toBe(slider);
      expect(slider.instant).toBe(true);
    });
  });

  describe('setDisplayFormat', () => {
    it('should record the format and return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setDisplayFormat(String)).toBe(slider);
      expect(slider.displayFormat).toBe(String);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const slider = SliderComponent.create__(createDiv());
      const original: SliderComponentOriginal = slider.asOriginalType3__();
      expect(original).toBe(slider);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const slider = SliderComponent.create__(createDiv());
      const mock = SliderComponent.fromOriginalType3__(slider.asOriginalType3__());
      expect(mock).toBe(slider);
    });
  });
});

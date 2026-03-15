import type { SliderComponent as SliderComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SliderComponent } from './SliderComponent.ts';

const VALUE_50 = 50;
const VALUE_75 = 75;
const MIN_10 = 10;
const MAX_200 = 200;
const STEP_5 = 5;

describe('SliderComponent', () => {
  it('should create an instance via create__', () => {
    const slider = SliderComponent.create__(createDiv());
    expect(slider).toBeInstanceOf(SliderComponent);
  });

  it('should have a slider input element', () => {
    const slider = SliderComponent.create__(createDiv());
    expect(slider.sliderEl.type).toBe('range');
  });

  describe('getValue / setValue', () => {
    it('should default to 0', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.getValue()).toBe(0);
    });

    it('should set and get value', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_50);
      expect(slider.getValue()).toBe(VALUE_50);
    });

    it('should call onChange callback when value is set', () => {
      const slider = SliderComponent.create__(createDiv());
      const cb = vi.fn();
      slider.onChange(cb);
      slider.setValue(VALUE_75);
      expect(cb).toHaveBeenCalledWith(VALUE_75);
    });
  });

  describe('getValuePretty', () => {
    it('should return value as string', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setValue(VALUE_50);
      expect(slider.getValuePretty()).toBe(String(VALUE_50));
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

    it('should handle null min and max', () => {
      const slider = SliderComponent.create__(createDiv());
      slider.setLimits(null, null, 'any');
      expect(slider.sliderEl.getAttribute('min')).toBe('0');
      expect(slider.sliderEl.getAttribute('max')).toBe('100');
      expect(slider.sliderEl.getAttribute('step')).toBe('any');
    });

    it('should return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setLimits(0, VALUE_50, 1)).toBe(slider);
    });
  });

  describe('setDynamicTooltip', () => {
    it('should return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setDynamicTooltip()).toBe(slider);
    });
  });

  describe('setInstant', () => {
    it('should return this', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(slider.setInstant(true)).toBe(slider);
    });
  });

  describe('showTooltip', () => {
    it('should not throw', () => {
      const slider = SliderComponent.create__(createDiv());
      expect(() => {
        slider.showTooltip();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const slider = SliderComponent.create__(createDiv());
      const original: SliderComponentOriginal = slider.asOriginalType__();
      expect(original).toBe(slider);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const slider = SliderComponent.create__(createDiv());
      const mock = SliderComponent.fromOriginalType2__(slider.asOriginalType__());
      expect(mock).toBe(slider);
    });
  });
});

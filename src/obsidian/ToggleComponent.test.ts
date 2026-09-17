import type { ToggleComponent as ToggleComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ToggleComponent } from './ToggleComponent.ts';

describe('ToggleComponent', () => {
  it('should create an instance via create__', () => {
    const toggle = ToggleComponent.create__(createDiv());
    expect(toggle).toBeInstanceOf(ToggleComponent);
  });

  describe('getValue / setValue', () => {
    it('should default to false', () => {
      const toggle = ToggleComponent.create__(createDiv());
      expect(toggle.getValue()).toBe(false);
      expect(toggle.on).toBe(false);
    });

    it('should set and get value', () => {
      const toggle = ToggleComponent.create__(createDiv());
      toggle.setValue(true);
      expect(toggle.getValue()).toBe(true);
      expect(toggle.toggleEl.hasClass('is-enabled')).toBe(true);
      toggle.setValue(false);
      expect(toggle.toggleEl.hasClass('is-enabled')).toBe(false);
    });

    it('should call onChange callback when the value changes', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const callback = vi.fn();
      toggle.onChange(callback);
      toggle.setValue(true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should not call onChange callback when the value is unchanged', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const callback = vi.fn();
      toggle.onChange(callback);
      toggle.setValue(false);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not throw when no onChange callback is set', () => {
      const toggle = ToggleComponent.create__(createDiv());
      expect(() => {
        toggle.setValue(true);
      }).not.toThrow();
    });
  });

  describe('onClick', () => {
    it('should toggle the value', () => {
      const toggle = ToggleComponent.create__(createDiv());
      expect(toggle.getValue()).toBe(false);
      toggle.onClick();
      expect(toggle.getValue()).toBe(true);
      toggle.onClick();
      expect(toggle.getValue()).toBe(false);
    });

    it('should call onChange callback with new value', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const callback = vi.fn();
      toggle.onChange(callback);
      toggle.onClick();
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should do nothing while disabled', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const callback = vi.fn();
      toggle.onChange(callback);
      toggle.setDisabled(true);
      toggle.onClick();
      expect(toggle.getValue()).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('setDisabled', () => {
    it('should toggle the is-disabled class and return this', () => {
      const toggle = ToggleComponent.create__(createDiv());
      expect(toggle.setDisabled(true)).toBe(toggle);
      expect(toggle.disabled).toBe(true);
      expect(toggle.toggleEl.hasClass('is-disabled')).toBe(true);
      toggle.setDisabled(false);
      expect(toggle.toggleEl.hasClass('is-disabled')).toBe(false);
    });
  });

  describe('setTooltip', () => {
    it('should set aria-label on toggleEl', () => {
      const toggle = ToggleComponent.create__(createDiv());
      toggle.setTooltip('Toggle hint');
      expect(toggle.toggleEl.getAttribute('aria-label')).toBe('Toggle hint');
    });

    it('should return this', () => {
      const toggle = ToggleComponent.create__(createDiv());
      expect(toggle.setTooltip('tip')).toBe(toggle);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const original: ToggleComponentOriginal = toggle.asOriginalType3__();
      expect(original).toBe(toggle);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const mock = ToggleComponent.fromOriginalType3__(toggle.asOriginalType3__());
      expect(mock).toBe(toggle);
    });
  });
});

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
    });

    it('should set and get value', () => {
      const toggle = ToggleComponent.create__(createDiv());
      toggle.setValue(true);
      expect(toggle.getValue()).toBe(true);
    });

    it('should call onChange callback', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const cb = vi.fn();
      toggle.onChange(cb);
      toggle.setValue(true);
      expect(cb).toHaveBeenCalledWith(true);
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
      const cb = vi.fn();
      toggle.onChange(cb);
      toggle.onClick();
      expect(cb).toHaveBeenCalledWith(true);
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

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const original: ToggleComponentOriginal = toggle.asOriginalType__();
      expect(original).toBe(toggle);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const toggle = ToggleComponent.create__(createDiv());
      const mock = ToggleComponent.fromOriginalType2__(toggle.asOriginalType__());
      expect(mock).toBe(toggle);
    });
  });
});

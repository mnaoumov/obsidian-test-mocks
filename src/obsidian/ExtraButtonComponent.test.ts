import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ExtraButtonComponent } from './ExtraButtonComponent.ts';

describe('ExtraButtonComponent', () => {
  function createExtraButton(): ExtraButtonComponent {
    const containerEl = createDiv();
    return ExtraButtonComponent.create__(containerEl);
  }

  it('should create an instance via create__', () => {
    const button = createExtraButton();
    expect(button).toBeInstanceOf(ExtraButtonComponent);
  });

  it('should throw when accessing an unmocked property', () => {
    const button = createExtraButton();
    const record = button as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in ExtraButtonComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const button = createExtraButton();
      const original: ExtraButtonComponentOriginal = button.asOriginalType__();
      expect(original).toBe(button);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const button = createExtraButton();
      const mock = ExtraButtonComponent.fromOriginalType__(button.asOriginalType__());
      expect(mock).toBe(button);
    });
  });

  describe('setIcon', () => {
    it('should set data-icon attribute on extraSettingsEl', () => {
      const button = createExtraButton();
      button.setIcon('lucide-settings');
      expect(button.extraSettingsEl.dataset['icon']).toBe('lucide-settings');
    });

    it('should return this for chaining', () => {
      const button = createExtraButton();
      expect(button.setIcon('icon')).toBe(button);
    });
  });

  describe('setTooltip', () => {
    it('should set aria-label attribute on extraSettingsEl', () => {
      const button = createExtraButton();
      button.setTooltip('Settings');
      expect(button.extraSettingsEl.getAttribute('aria-label')).toBe('Settings');
    });

    it('should return this for chaining', () => {
      const button = createExtraButton();
      expect(button.setTooltip('tip')).toBe(button);
    });
  });

  describe('setDisabled', () => {
    it('should set the disabled property', () => {
      const button = createExtraButton();
      button.setDisabled(true);
      expect(button.disabled).toBe(true);
    });

    it('should return this for chaining', () => {
      const button = createExtraButton();
      expect(button.setDisabled(false)).toBe(button);
    });
  });

  describe('onClick', () => {
    it('should register a click handler', () => {
      const button = createExtraButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.simulateClick__();
      expect(handler).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const button = createExtraButton();
      expect(button.onClick(vi.fn())).toBe(button);
    });
  });

  describe('simulateClick__', () => {
    it('should invoke the click handler', () => {
      const button = createExtraButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.simulateClick__();
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should not throw if no handler is registered', () => {
      const button = createExtraButton();
      expect(() => {
        button.simulateClick__();
      }).not.toThrow();
    });
  });
});

import type { ExtraButtonComponent as ExtraButtonComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
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
    const record = ensureGenericObject(button);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in ExtraButtonComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const button = createExtraButton();
      const original: ExtraButtonComponentOriginal = button.asOriginalType2__();
      expect(original).toBe(button);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const button = createExtraButton();
      const mock = ExtraButtonComponent.fromOriginalType2__(button.asOriginalType2__());
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
    it('should set the disabled property, the is-disabled class and the tab order', () => {
      const button = createExtraButton();
      expect(button.extraSettingsEl.getAttribute('tabindex')).toBe('0');
      button.setDisabled(true);
      expect(button.disabled).toBe(true);
      expect(button.extraSettingsEl.hasClass('is-disabled')).toBe(true);
      expect(button.extraSettingsEl.hasAttribute('tabindex')).toBe(false);
      button.setDisabled(false);
      expect(button.extraSettingsEl.hasClass('is-disabled')).toBe(false);
      expect(button.extraSettingsEl.getAttribute('tabindex')).toBe('0');
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

    it('should not invoke the handler while disabled', () => {
      const button = createExtraButton();
      const handler = vi.fn();
      button.onClick(handler).setDisabled(true);
      button.simulateClick__();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('element events', () => {
    it('should invoke the handler on click', () => {
      const button = createExtraButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.extraSettingsEl.click();
      expect(handler).toHaveBeenCalledOnce();
      expect(button.changeCallback).toBe(handler);
    });

    it('should invoke the handler on Enter and Space, but not on other keys', () => {
      const button = createExtraButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.extraSettingsEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(handler).not.toHaveBeenCalled();
      button.extraSettingsEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      button.extraSettingsEl.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });
});

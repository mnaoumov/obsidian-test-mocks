import type { ButtonComponent as ButtonComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { ButtonComponent } from './ButtonComponent.ts';

describe('ButtonComponent', () => {
  function createButton(): ButtonComponent {
    const containerEl = createDiv();
    return ButtonComponent.create__(containerEl);
  }

  it('should create an instance via create__', () => {
    const button = createButton();
    expect(button).toBeInstanceOf(ButtonComponent);
  });

  it('should create buttonEl as child of containerEl', () => {
    const containerEl = createDiv();
    const button = ButtonComponent.create__(containerEl);
    expect(button.buttonEl.parentElement).toBe(containerEl);
  });

  it('should throw when accessing an unmocked property', () => {
    const button = createButton();
    const record = ensureGenericObject(button);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in ButtonComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const button = createButton();
      const original: ButtonComponentOriginal = button.asOriginalType2__();
      expect(original).toBe(button);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const button = createButton();
      const mock = ButtonComponent.fromOriginalType2__(button.asOriginalType2__());
      expect(mock).toBe(button);
    });
  });

  describe('setButtonText', () => {
    it('should set button text content', () => {
      const button = createButton();
      button.setButtonText('Click me');
      expect(button.buttonEl.textContent).toBe('Click me');
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setButtonText('test')).toBe(button);
    });
  });

  describe('setCta', () => {
    it('should add mod-cta class to buttonEl', () => {
      const button = createButton();
      button.setCta();
      expect(button.buttonEl.classList.contains('mod-cta')).toBe(true);
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setCta()).toBe(button);
    });
  });

  describe('removeCta', () => {
    it('should remove mod-cta class from buttonEl', () => {
      const button = createButton();
      button.setCta();
      button.removeCta();
      expect(button.buttonEl.classList.contains('mod-cta')).toBe(false);
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.removeCta()).toBe(button);
    });
  });

  describe('setWarning', () => {
    it('should add mod-warning class to buttonEl', () => {
      const button = createButton();
      button.setWarning();
      expect(button.buttonEl.classList.contains('mod-warning')).toBe(true);
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setWarning()).toBe(button);
    });
  });

  describe('setClass', () => {
    it('should add the specified class to buttonEl', () => {
      const button = createButton();
      button.setClass('custom-class');
      expect(button.buttonEl.classList.contains('custom-class')).toBe(true);
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setClass('cls')).toBe(button);
    });
  });

  describe('setIcon', () => {
    it('should set data-icon attribute on buttonEl', () => {
      const button = createButton();
      button.setIcon('lucide-star');
      expect(button.buttonEl.dataset['icon']).toBe('lucide-star');
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setIcon('icon')).toBe(button);
    });
  });

  describe('setTooltip', () => {
    it('should set aria-label attribute on buttonEl', () => {
      const button = createButton();
      button.setTooltip('My tooltip');
      expect(button.buttonEl.getAttribute('aria-label')).toBe('My tooltip');
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.setTooltip('tip')).toBe(button);
    });
  });

  describe('onClick', () => {
    it('should register click handler', () => {
      const button = createButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.simulateClick__();
      expect(handler).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const button = createButton();
      expect(button.onClick(vi.fn())).toBe(button);
    });
  });

  describe('simulateClick__', () => {
    it('should invoke the click handler', () => {
      const button = createButton();
      const handler = vi.fn();
      button.onClick(handler);
      button.simulateClick__();
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should not throw if no handler is registered', () => {
      const button = createButton();
      expect(() => {
        button.simulateClick__();
      }).not.toThrow();
    });
  });
});

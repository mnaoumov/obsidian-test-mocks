import type { TextComponent as TextComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { TextComponent } from './TextComponent.ts';

describe('TextComponent', () => {
  it('should create an instance via create__', () => {
    const component = TextComponent.create__(createDiv());
    expect(component).toBeInstanceOf(TextComponent);
  });

  it('should have an input element', () => {
    const component = TextComponent.create__(createDiv());
    expect(component.inputEl.tagName.toLowerCase()).toBe('input');
  });

  describe('eventListeners__', () => {
    it('should track added event listeners', () => {
      const component = TextComponent.create__(createDiv());
      const handler = vi.fn();
      component.inputEl.addEventListener('input', handler);
      expect(component.eventListeners__['input']).toHaveLength(1);
    });
  });

  describe('simulateEvent__', () => {
    it('should call registered handlers for the event', () => {
      const component = TextComponent.create__(createDiv());
      const handler = vi.fn();
      component.inputEl.addEventListener('change', handler);
      component.simulateEvent__('change');
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should not throw for events with no handlers', () => {
      const component = TextComponent.create__(createDiv());
      expect(() => {
        component.simulateEvent__('unknown');
      }).not.toThrow();
    });
  });

  describe('onChange', () => {
    it('should register an onChange callback', () => {
      const component = TextComponent.create__(createDiv());
      const cb = vi.fn();
      component.onChange(cb);
      component.setValue('new value');
      expect(cb).toHaveBeenCalledWith('new value');
    });

    it('should return this', () => {
      const component = TextComponent.create__(createDiv());
      expect(component.onChange(vi.fn())).toBe(component);
    });
  });

  describe('addEventListener wrapper', () => {
    it('should not track non-function handlers', () => {
      const component = TextComponent.create__(createDiv());
      component.inputEl.addEventListener('click', { handleEvent: vi.fn() });
      expect(component.eventListeners__['click']).toBeUndefined();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const component = TextComponent.create__(createDiv());
      const original: TextComponentOriginal = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const component = TextComponent.create__(createDiv());
      const mock = TextComponent.fromOriginalType3__(component.asOriginalType__());
      expect(mock).toBe(component);
    });
  });
});

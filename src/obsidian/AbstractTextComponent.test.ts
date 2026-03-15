import type { AbstractTextComponent as AbstractTextComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AbstractTextComponent } from './AbstractTextComponent.ts';
import { TextComponent } from './TextComponent.ts';

class BareTextComponent extends AbstractTextComponent<HTMLInputElement> {
}

// AbstractTextComponent is abstract, so we test it through TextComponent.
describe('AbstractTextComponent', () => {
  function createTextComponent(): TextComponent {
    const containerEl = createDiv();
    return TextComponent.create__(containerEl);
  }

  it('should create an instance', () => {
    const component = createTextComponent();
    expect(component).toBeInstanceOf(TextComponent);
  });

  describe('getValue', () => {
    it('should return empty string initially', () => {
      const component = createTextComponent();
      expect(component.getValue()).toBe('');
    });
  });

  describe('setValue', () => {
    it('should set the value', () => {
      const component = createTextComponent();
      component.setValue('hello');
      expect(component.getValue()).toBe('hello');
    });

    it('should update inputEl value', () => {
      const component = createTextComponent();
      component.setValue('world');
      expect(component.inputEl.value).toBe('world');
    });

    it('should invoke onChange callback', () => {
      const component = createTextComponent();
      const cb = vi.fn();
      component.onChange(cb);
      component.setValue('test');
      expect(cb).toHaveBeenCalledWith('test');
    });

    it('should return this for chaining', () => {
      const component = createTextComponent();
      expect(component.setValue('val')).toBe(component);
    });

    it('should not throw if no onChange callback is registered', () => {
      const component = createTextComponent();
      expect(() => {
        component.setValue('safe');
      }).not.toThrow();
    });
  });

  describe('onChange', () => {
    it('should return this for chaining', () => {
      const component = createTextComponent();
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Testing chaining with noop callback.
      expect(component.onChange(() => {})).toBe(component);
    });
  });

  describe('onChanged', () => {
    it('should invoke the onChange callback with current value', () => {
      const component = createTextComponent();
      const cb = vi.fn();
      component.onChange(cb);
      component.setValue('initial');
      cb.mockClear();
      component.onChanged();
      expect(cb).toHaveBeenCalledWith('initial');
    });

    it('should not throw if no callback is registered', () => {
      const component = createTextComponent();
      expect(() => {
        component.onChanged();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const component = createTextComponent();
      const original = component.asOriginalType__();
      expect(original).toBe(component);
    });

    it('should return the same instance via AbstractTextComponent base class', () => {
      const component = new BareTextComponent(createEl('input'));
      const original: AbstractTextComponentOriginal<HTMLInputElement> = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const component = createTextComponent();
      const mock = AbstractTextComponent.fromOriginalType2__(component.asOriginalType__());
      expect(mock).toBe(component);
    });
  });

  describe('setPlaceholder', () => {
    it('should set the placeholder on inputEl', () => {
      const component = createTextComponent();
      component.setPlaceholder('Enter text...');
      expect(component.inputEl.placeholder).toBe('Enter text...');
    });

    it('should return this for chaining', () => {
      const component = createTextComponent();
      expect(component.setPlaceholder('test')).toBe(component);
    });
  });

  describe('constructor3__', () => {
    it('should be callable without throwing', () => {
      const component = createTextComponent();
      expect(() => {
        component.constructor3__(component.inputEl);
      }).not.toThrow();
    });
  });
});

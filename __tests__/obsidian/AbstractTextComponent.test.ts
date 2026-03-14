import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { TextComponent } from '../../src/obsidian/TextComponent.ts';

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
});

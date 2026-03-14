import type { BaseComponent as BaseComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { BaseComponent } from './BaseComponent.ts';
import { ButtonComponent } from './ButtonComponent.ts';

// Minimal concrete subclass that does NOT override asOriginalType__.
class MinimalComponent extends BaseComponent {
  public constructor() {
    super();
  }

  public static create(): MinimalComponent {
    return new MinimalComponent();
  }
}

// BaseComponent is abstract, so we test it through ButtonComponent (a concrete subclass).
describe('BaseComponent', () => {
  function createComponent(): ButtonComponent {
    return ButtonComponent.create__(createDiv());
  }

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const component = createComponent();
      const original: BaseComponentOriginal = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });

  describe('disabled', () => {
    it('should default to false', () => {
      const component = createComponent();
      expect(component.disabled).toBe(false);
    });
  });

  describe('setDisabled', () => {
    it('should set the disabled property', () => {
      const component = createComponent();
      component.setDisabled(true);
      expect(component.disabled).toBe(true);
    });

    it('should return this for chaining', () => {
      const component = createComponent();
      expect(component.setDisabled(false)).toBe(component);
    });
  });

  describe('constructor__', () => {
    it('should be callable via spyOn', () => {
      const spy = vi.spyOn(ButtonComponent.prototype, 'constructor__');
      createComponent();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('then', () => {
    it('should invoke the callback with the component', () => {
      const component = createComponent();
      const cb = vi.fn();
      component.then(cb);
      expect(cb).toHaveBeenCalledWith(component);
    });

    it('should return this for chaining', () => {
      const component = createComponent();
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Testing chaining with noop callback.
      expect(component.then(() => {})).toBe(component);
    });
  });

  describe('BaseComponent.asOriginalType__', () => {
    it('should return the same instance when not overridden', () => {
      const component = MinimalComponent.create();
      const original = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });
});

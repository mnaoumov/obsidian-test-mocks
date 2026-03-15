import type { Component as ComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Component } from './Component.ts';

describe('Component', () => {
  it('should create an instance via create__', () => {
    const component = Component.create__();
    expect(component).toBeInstanceOf(Component);
  });

  it('should throw when accessing an unmocked property', () => {
    const component = Component.create__();
    const record = component as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in Component. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const component = Component.create__();
      const original: ComponentOriginal = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const component = Component.create__();
      const mock = Component.fromOriginalType__(component.asOriginalType__());
      expect(mock).toBe(component);
    });
  });

  describe('load', () => {
    it('should set loaded__ to true', () => {
      const component = Component.create__();
      component.load();
      expect(component.loaded__).toBe(true);
    });

    it('should call onload', () => {
      const component = Component.create__();
      const spy = vi.spyOn(component, 'onload');
      component.load();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('unload', () => {
    it('should set loaded__ to false', () => {
      const component = Component.create__();
      component.load();
      component.unload();
      expect(component.loaded__).toBe(false);
    });

    it('should call onunload', () => {
      const component = Component.create__();
      component.load();
      const spy = vi.spyOn(component, 'onunload');
      component.unload();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call onunload if not loaded', () => {
      const component = Component.create__();
      const spy = vi.spyOn(component, 'onunload');
      component.unload();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should run registered cleanup callbacks', () => {
      const component = Component.create__();
      component.load();
      const cleanup = vi.fn();
      component.register(cleanup);
      component.unload();
      expect(cleanup).toHaveBeenCalled();
    });

    it('should clear children, events, cleanups, and intervals', () => {
      const component = Component.create__();
      component.load();
      const child = Component.create__();
      component.addChild(child);
      component.registerEvent({ e: component.asOriginalType__(), fn: vi.fn(), name: 'test' });
      component.register(vi.fn());
      component.registerInterval(0);
      component.unload();
      expect(component.children__).toHaveLength(0);
      expect(component.events__).toHaveLength(0);
      expect(component.cleanups__).toHaveLength(0);
      expect(component.intervals__).toHaveLength(0);
    });

    it('should clear intervals on unload', () => {
      const component = Component.create__();
      component.load();
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      const intervalId = 42;
      component.registerInterval(intervalId);
      component.unload();
      expect(clearSpy).toHaveBeenCalledWith(intervalId);
      clearSpy.mockRestore();
    });
  });

  describe('addChild', () => {
    it('should add a child component', () => {
      const parent = Component.create__();
      const child = Component.create__();
      parent.addChild(child);
      expect(parent.children__).toContain(child);
    });

    it('should return the added child', () => {
      const parent = Component.create__();
      const child = Component.create__();
      const result = parent.addChild(child);
      expect(result).toBe(child);
    });

    it('should load the child if parent is loaded', () => {
      const parent = Component.create__();
      parent.load();
      const child = Component.create__();
      parent.addChild(child);
      expect(child.loaded__).toBe(true);
    });

    it('should not load the child if parent is not loaded', () => {
      const parent = Component.create__();
      const child = Component.create__();
      parent.addChild(child);
      expect(child.loaded__).toBe(false);
    });
  });

  describe('removeChild', () => {
    it('should remove a child component', () => {
      const parent = Component.create__();
      const child = Component.create__();
      parent.addChild(child);
      parent.removeChild(child);
      expect(parent.children__).not.toContain(child);
    });

    it('should unload the removed child', () => {
      const parent = Component.create__();
      parent.load();
      const child = Component.create__();
      parent.addChild(child);
      parent.removeChild(child);
      expect(child.loaded__).toBe(false);
    });

    it('should return the removed child', () => {
      const parent = Component.create__();
      const child = Component.create__();
      parent.addChild(child);
      const result = parent.removeChild(child);
      expect(result).toBe(child);
    });

    it('should handle removing a child that is not present', () => {
      const parent = Component.create__();
      const child = Component.create__();
      const result = parent.removeChild(child);
      expect(result).toBe(child);
    });
  });

  describe('register', () => {
    it('should add a cleanup callback', () => {
      const component = Component.create__();
      const cleanup = vi.fn();
      component.register(cleanup);
      expect(component.cleanups__).toContain(cleanup);
    });
  });

  describe('registerDomEvent', () => {
    it('should add an event listener to the element', () => {
      const component = Component.create__();
      const el = createDiv();
      const cb = vi.fn();
      component.registerDomEvent(el, 'click', cb);
      el.dispatchEvent(new Event('click'));
      expect(cb).toHaveBeenCalled();
    });

    it('should remove the event listener on unload', () => {
      const component = Component.create__();
      component.load();
      const el = createDiv();
      const cb = vi.fn();
      component.registerDomEvent(el, 'click', cb);
      component.unload();
      el.dispatchEvent(new Event('click'));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('registerEvent', () => {
    it('should store the event ref', () => {
      const component = Component.create__();
      const ref = { e: component.asOriginalType__(), fn: vi.fn(), name: 'test' };
      component.registerEvent(ref);
      expect(component.events__).toContain(ref);
    });
  });

  describe('registerInterval', () => {
    it('should store the interval id', () => {
      const intervalId = 123;
      const component = Component.create__();
      const result = component.registerInterval(intervalId);
      expect(component.intervals__).toContain(intervalId);
      expect(result).toBe(intervalId);
    });
  });

  describe('onload', () => {
    it('should be callable without error', () => {
      const component = Component.create__();
      expect(() => {
        component.onload();
      }).not.toThrow();
    });
  });

  describe('onunload', () => {
    it('should be callable without error', () => {
      const component = Component.create__();
      expect(() => {
        component.onunload();
      }).not.toThrow();
    });
  });
});

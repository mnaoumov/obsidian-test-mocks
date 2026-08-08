import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { SecretComponent } from './SecretComponent.ts';

describe('SecretComponent', () => {
  it('should create an instance via create__', () => {
    const app = App.createConfigured__();
    const comp = SecretComponent.create__(app, createDiv());
    expect(comp).toBeInstanceOf(SecretComponent);
  });

  describe('onChange', () => {
    it('should register callback and return this', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const callback = vi.fn();
      const result = comp.onChange(callback);
      expect(result).toBe(comp);
    });
  });

  describe('setValue', () => {
    it('should invoke onChange callback with value', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const callback = vi.fn();
      comp.onChange(callback);
      comp.setValue('secret123');
      expect(callback).toHaveBeenCalledWith('secret123');
    });

    it('should return this', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      expect(comp.setValue('val')).toBe(comp);
    });

    it('should not throw when no onChange callback is set', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      expect(() => {
        comp.setValue('val');
      }).not.toThrow();
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const original: SecretComponentOriginal = comp.asOriginalType2__();
      expect(original).toBe(comp);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const mock = SecretComponent.fromOriginalType2__(comp.asOriginalType2__());
      expect(mock).toBe(comp);
    });
  });
});

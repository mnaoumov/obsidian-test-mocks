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
  it('should create an instance via create__', async () => {
    const app = await App.createConfigured__();
    const comp = SecretComponent.create__(app, createDiv());
    expect(comp).toBeInstanceOf(SecretComponent);
  });

  describe('onChange', () => {
    it('should register callback and return this', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const cb = vi.fn();
      const result = comp.onChange(cb);
      expect(result).toBe(comp);
    });
  });

  describe('setValue', () => {
    it('should invoke onChange callback with value', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const cb = vi.fn();
      comp.onChange(cb);
      comp.setValue('secret123');
      expect(cb).toHaveBeenCalledWith('secret123');
    });

    it('should return this', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      expect(comp.setValue('val')).toBe(comp);
    });

    it('should not throw when no onChange callback is set', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      expect(() => {
        comp.setValue('val');
      }).not.toThrow();
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const original: SecretComponentOriginal = comp.asOriginalType2__();
      expect(original).toBe(comp);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const comp = SecretComponent.create__(app, createDiv());
      const mock = SecretComponent.fromOriginalType2__(comp.asOriginalType2__());
      expect(mock).toBe(comp);
    });
  });
});

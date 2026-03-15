import type { Scope as ScopeOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Scope } from './Scope.ts';

describe('Scope', () => {
  it('should create an instance via create__', () => {
    const scope = Scope.create__();
    expect(scope).toBeInstanceOf(Scope);
  });

  it('should accept a parent scope', () => {
    const parent = Scope.create__();
    const child = Scope.create__(parent);
    expect(child).toBeInstanceOf(Scope);
  });

  describe('register / unregister', () => {
    it('should register a key handler and return a handler object', () => {
      const scope = Scope.create__();
      const handler = scope.register(['Mod'], 'a', vi.fn());
      expect(handler).toBeDefined();
      expect(handler.key).toBe('a');
    });

    it('should register with null modifiers', () => {
      const scope = Scope.create__();
      const handler = scope.register(null, 'Escape', vi.fn());
      expect(handler.modifiers).toBeNull();
    });

    it('should unregister a handler', () => {
      const scope = Scope.create__();
      const handler = scope.register(null, 'Enter', vi.fn());
      // Should not throw
      expect(() => {
        scope.unregister(handler);
      }).not.toThrow();
    });

    it('should handle unregistering a handler that does not exist', () => {
      const scope = Scope.create__();
      const handler = scope.register(null, 'x', vi.fn());
      scope.unregister(handler);
      // Unregister again should not throw
      expect(() => {
        scope.unregister(handler);
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const scope = Scope.create__();
      const original: ScopeOriginal = scope.asOriginalType__();
      expect(original).toBe(scope);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const scope = Scope.create__();
      const mock = Scope.fromOriginalType__(scope.asOriginalType__());
      expect(mock).toBe(scope);
    });
  });
});

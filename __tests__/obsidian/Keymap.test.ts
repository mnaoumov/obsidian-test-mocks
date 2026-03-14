import type { Keymap as KeymapOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Keymap } from '../../src/obsidian/Keymap.ts';
import { Scope } from '../../src/obsidian/Scope.ts';

describe('Keymap', () => {
  it('should create an instance via create__', () => {
    const keymap = Keymap.create__();
    expect(keymap).toBeInstanceOf(Keymap);
  });

  describe('isModEvent', () => {
    it('should return false', () => {
      expect(Keymap.isModEvent(null)).toBe(false);
    });

    it('should accept undefined', () => {
      expect(Keymap.isModEvent()).toBe(false);
    });
  });

  describe('isModifier', () => {
    it('should return false', () => {
      const event = new KeyboardEvent('keydown');
      expect(Keymap.isModifier(event, 'Mod')).toBe(false);
    });
  });

  describe('pushScope / popScope', () => {
    it('should push and pop scopes', () => {
      const keymap = Keymap.create__();
      const scope = Scope.create__();
      keymap.pushScope(scope);
      // Should not throw when popping
      expect(() => {
        keymap.popScope(scope);
      }).not.toThrow();
    });

    it('should handle popping a scope that was not pushed', () => {
      const keymap = Keymap.create__();
      const scope = Scope.create__();
      // Should not throw
      expect(() => {
        keymap.popScope(scope);
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const keymap = Keymap.create__();
      const original: KeymapOriginal = keymap.asOriginalType__();
      expect(original).toBe(keymap);
    });
  });
});

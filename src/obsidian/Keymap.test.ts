import type { Keymap as KeymapOriginal } from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { Keymap } from './Keymap.ts';
import { Scope } from './Scope.ts';
import { Platform } from './vars/Platform.ts';

const MIDDLE_MOUSE_BUTTON = 1;

describe('Keymap', () => {
  it('should create an instance via create__', () => {
    const keymap = Keymap.create__();
    expect(keymap).toBeInstanceOf(Keymap);
  });

  describe('isModEvent', () => {
    it('should return false for a null event', () => {
      expect(Keymap.isModEvent(null)).toBe(false);
    });

    it('should accept undefined', () => {
      expect(Keymap.isModEvent()).toBe(false);
    });

    it('should return false for an unmodified event', () => {
      expect(Keymap.isModEvent(new MouseEvent('click'))).toBe(false);
    });

    it('should return tab for a middle click', () => {
      expect(Keymap.isModEvent(new MouseEvent('mousedown', { button: MIDDLE_MOUSE_BUTTON }))).toBe('tab');
    });

    it('should return tab for a Mod click', () => {
      expect(Keymap.isModEvent(new MouseEvent('click', { ctrlKey: true }))).toBe('tab');
    });

    it('should return split for a Mod + Alt click', () => {
      expect(Keymap.isModEvent(new MouseEvent('click', { altKey: true, ctrlKey: true }))).toBe('split');
    });

    it('should return window for a Mod + Alt + Shift click', () => {
      expect(Keymap.isModEvent(new MouseEvent('click', { altKey: true, ctrlKey: true, shiftKey: true }))).toBe('window');
    });
  });

  describe('isModifier', () => {
    afterEach(() => {
      Platform.isMacOS = false;
    });

    it('should read the matching modifier flag from the event', () => {
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { altKey: true }), 'Alt')).toBe(true);
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { ctrlKey: true }), 'Ctrl')).toBe(true);
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { metaKey: true }), 'Meta')).toBe(true);
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { shiftKey: true }), 'Shift')).toBe(true);
    });

    it('should return false when the modifier is not held', () => {
      const event = new KeyboardEvent('keydown');
      expect(Keymap.isModifier(event, 'Alt')).toBe(false);
      expect(Keymap.isModifier(event, 'Ctrl')).toBe(false);
      expect(Keymap.isModifier(event, 'Meta')).toBe(false);
      expect(Keymap.isModifier(event, 'Mod')).toBe(false);
      expect(Keymap.isModifier(event, 'Shift')).toBe(false);
    });

    it('should map Mod to Ctrl when not on macOS', () => {
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { ctrlKey: true }), 'Mod')).toBe(true);
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { metaKey: true }), 'Mod')).toBe(false);
    });

    it('should map Mod to Meta on macOS', () => {
      Platform.isMacOS = true;
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { metaKey: true }), 'Mod')).toBe(true);
      expect(Keymap.isModifier(new KeyboardEvent('keydown', { ctrlKey: true }), 'Mod')).toBe(false);
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

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const keymap = Keymap.create__();
      const mock = Keymap.fromOriginalType__(keymap.asOriginalType__());
      expect(mock).toBe(keymap);
    });
  });
});

import type { MenuItem as MenuItemOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Menu } from './Menu.ts';
import { MenuItem } from './MenuItem.ts';

describe('MenuItem', () => {
  it('should create an instance via create__', () => {
    const menu = Menu.create2__();
    const item = MenuItem.create__(menu);
    expect(item).toBeInstanceOf(MenuItem);
  });

  describe('setTitle', () => {
    it('should set the title and return this', () => {
      const item = MenuItem.create__(null);
      const result = item.setTitle('My Item');
      expect(item.title__).toBe('My Item');
      expect(result).toBe(item);
    });
  });

  describe('setIcon', () => {
    it('should set the icon and return this', () => {
      const item = MenuItem.create__(null);
      const result = item.setIcon('star');
      expect(item.icon__).toBe('star');
      expect(result).toBe(item);
    });
  });

  describe('onClick', () => {
    it('should set the click handler and return this', () => {
      const item = MenuItem.create__(null);
      const handler = vi.fn();
      const result = item.onClick(handler);
      expect(item.onClick__).toBe(handler);
      expect(result).toBe(item);
    });
  });

  describe('setChecked', () => {
    it('should set checked state', () => {
      const item = MenuItem.create__(null);
      item.setChecked(true);
      expect(item.checked__).toBe(true);
    });
  });

  describe('setDisabled', () => {
    it('should set disabled state', () => {
      const item = MenuItem.create__(null);
      item.setDisabled(true);
      expect(item.disabled__).toBe(true);
    });
  });

  describe('setIsLabel', () => {
    it('should set isLabel state', () => {
      const item = MenuItem.create__(null);
      item.setIsLabel(true);
      expect(item.isLabel__).toBe(true);
    });
  });

  describe('setSection', () => {
    it('should set section', () => {
      const item = MenuItem.create__(null);
      item.setSection('main');
      expect(item.section__).toBe('main');
    });
  });

  describe('setWarning', () => {
    it('should set warning state', () => {
      const item = MenuItem.create__(null);
      item.setWarning(true);
      expect(item.warning__).toBe(true);
    });
  });

  describe('setSubmenu', () => {
    it('should return a new Menu', () => {
      const item = MenuItem.create__(null);
      const submenu = item.setSubmenu();
      expect(submenu).toBeInstanceOf(Menu);
    });
  });

  describe('constructor__', () => {
    it('should not throw', () => {
      const item = MenuItem.create__(null);
      expect(() => {
        item.constructor__(null);
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const item = MenuItem.create__(null);
      const original: MenuItemOriginal = item.asOriginalType__();
      expect(original).toBe(item);
    });
  });
});

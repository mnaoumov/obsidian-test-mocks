import type { Menu as MenuOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Menu } from './Menu.ts';

describe('Menu', () => {
  it('should create an instance via create2__', () => {
    const menu = Menu.create2__();
    expect(menu).toBeInstanceOf(Menu);
  });

  describe('forEvent', () => {
    it('should create a menu from a mouse event', () => {
      const event = new MouseEvent('click');
      const menu = Menu.forEvent(event);
      expect(menu).toBeInstanceOf(Menu);
    });
  });

  describe('addItem', () => {
    it('should call the callback with a MenuItem', () => {
      const menu = Menu.create2__();
      const cb = vi.fn();
      menu.addItem(cb);
      expect(cb).toHaveBeenCalledOnce();
    });

    it('should add the item to items__', () => {
      const menu = Menu.create2__();
      menu.addItem(() => {
        // Noop
      });
      expect(menu.items__.length).toBe(1);
    });

    it('should return this for chaining', () => {
      const menu = Menu.create2__();
      const result = menu.addItem(() => {
        // Noop
      });
      expect(result).toBe(menu);
    });
  });

  describe('addSeparator', () => {
    it('should return this for chaining', () => {
      const menu = Menu.create2__();
      expect(menu.addSeparator()).toBe(menu);
    });
  });

  describe('close', () => {
    it('should call onHide callback', () => {
      const menu = Menu.create2__();
      const cb = vi.fn();
      menu.onHide(cb);
      menu.close();
      expect(cb).toHaveBeenCalledOnce();
    });

    it('should not throw when no onHide callback set', () => {
      const menu = Menu.create2__();
      expect(() => {
        menu.close();
      }).not.toThrow();
    });
  });

  describe('hide', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      expect(menu.hide()).toBe(menu);
    });
  });

  describe('setNoIcon', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      expect(menu.setNoIcon()).toBe(menu);
    });
  });

  describe('setUseNativeMenu', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      expect(menu.setUseNativeMenu(true)).toBe(menu);
    });
  });

  describe('showAtMouseEvent', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      const event = new MouseEvent('click');
      expect(menu.showAtMouseEvent(event)).toBe(menu);
    });
  });

  describe('showAtPosition', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      expect(menu.showAtPosition({ x: 0, y: 0 })).toBe(menu);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const menu = Menu.create2__();
      const original: MenuOriginal = menu.asOriginalType2__();
      expect(original).toBe(menu);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const menu = Menu.create2__();
      const mock = Menu.fromOriginalType2__(menu.asOriginalType2__());
      expect(mock).toBe(menu);
    });
  });
});

import type { Menu as MenuOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { Menu } from './Menu.ts';
import { MenuSeparator } from './MenuSeparator.ts';

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
      const callback = vi.fn();
      menu.addItem(callback);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should add the item to items', () => {
      const menu = Menu.create2__();
      menu.addItem(() => {
        noop();
      });
      expect(menu.items.length).toBe(1);
    });

    it('should return this for chaining', () => {
      const menu = Menu.create2__();
      const result = menu.addItem(() => {
        noop();
      });
      expect(result).toBe(menu);
    });
  });

  describe('addSeparator', () => {
    it('should return this for chaining', () => {
      const menu = Menu.create2__();
      expect(menu.addSeparator()).toBe(menu);
    });

    it('should record the separator in items, so a count matches what Obsidian reports', () => {
      const menu = Menu.create2__();
      menu.addSeparator();
      expect(menu.items).toHaveLength(1);
      expect(menu.items[0]).toBeInstanceOf(MenuSeparator);
    });

    it('should interleave with items in insertion order', () => {
      const menu = Menu.create2__();
      menu.addItem((item) => item.setTitle('Before'));
      menu.addSeparator();
      menu.addItem((item) => item.setTitle('After'));

      expect(menu.items.map((item) => item instanceof MenuSeparator)).toEqual([false, true, false]);
    });
  });

  describe('menuItems__', () => {
    it('should be empty for a fresh menu', () => {
      expect(Menu.create2__().menuItems__).toEqual([]);
    });

    it('should exclude separators, leaving the items readable without narrowing', () => {
      const menu = Menu.create2__();
      menu.addItem((item) => item.setTitle('First'));
      menu.addSeparator();
      menu.addItem((item) => item.setTitle('Second'));

      expect(menu.menuItems__.map((item) => item.title__)).toEqual(['First', 'Second']);
    });

    it('should reflect a later addition, being a getter over items', () => {
      const menu = Menu.create2__();
      expect(menu.menuItems__).toHaveLength(0);

      menu.addItem((item) => item.setTitle('Added later'));
      expect(menu.menuItems__).toHaveLength(1);
    });
  });

  describe('close', () => {
    it('should call onHide callback', () => {
      const menu = Menu.create2__();
      const callback = vi.fn();
      menu.onHide(callback);
      menu.close();
      expect(callback).toHaveBeenCalledOnce();
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

  describe('setParentElement', () => {
    it('should return this', () => {
      const menu = Menu.create2__();
      expect(menu.setParentElement(createDiv())).toBe(menu);
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
  describe('setSectionSubmenu', () => {
    it('should record the section submenu config', () => {
      const menu = Menu.create2__();
      menu.setSectionSubmenu('Patterns', { icon: 'lucide-wand', title: 'Patterns' });

      expect(menu.sectionSubmenus__.get('Patterns')).toEqual({ icon: 'lucide-wand', title: 'Patterns' });
    });

    it('should return the menu so calls can chain', () => {
      const menu = Menu.create2__();

      expect(menu.setSectionSubmenu('A', { icon: '', title: 'A' })).toBe(menu);
    });

    it('should overwrite the config when the same section is set twice', () => {
      const menu = Menu.create2__();
      menu.setSectionSubmenu('A', { icon: 'first', title: 'A' });
      menu.setSectionSubmenu('A', { icon: 'second', title: 'A' });

      expect(menu.sectionSubmenus__.size).toBe(1);
      expect(menu.sectionSubmenus__.get('A')?.icon).toBe('second');
    });
  });
});

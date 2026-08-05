import type {
  MenuItem as MenuItemOriginal,
  Menu as MenuOriginal
} from 'obsidian';

import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { Menu } from '../../obsidian/Menu.ts';
import {
  bridgeMenu,
  unbridgeMenu
} from './menu-bridge.ts';

interface SectionSubmenuConfig {
  readonly icon: string;
  readonly title: string;
}

type SetSectionSubmenuFn = (this: MenuOriginal, section: string, config: SectionSubmenuConfig) => MenuOriginal;

describe('menu-bridge', () => {
  afterEach(() => {
    unbridgeMenu();
  });

  function callSetSectionSubmenu(menu: MenuOriginal, section: string, icon: string, title: string): MenuOriginal {
    const fn = ensureGenericObject(menu)['setSectionSubmenu'] as SetSectionSubmenuFn;
    return fn.call(menu, section, { icon, title });
  }

  function readItems(menu: MenuOriginal): MenuItemOriginal[] {
    return ensureGenericObject(menu)['items'] as MenuItemOriginal[];
  }

  describe('items', () => {
    it('should throw without the bridge, which is what made `menu.items` untestable', () => {
      const menu = Menu.create2__();
      expect(() => readItems(menu.asOriginalType2__())).toThrow();
    });

    it('should report an empty list for a fresh menu', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      expect(readItems(menu.asOriginalType2__())).toEqual([]);
    });

    it('should expose every added item, in order', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      menu.addItem((item) => item.setTitle('First'));
      menu.addItem((item) => item.setTitle('Second'));

      const items = readItems(menu.asOriginalType2__());
      expect(items).toHaveLength(2);
      expect(menu.menuItems__.map((item) => item.title__)).toEqual(['First', 'Second']);
    });

    it('should include separators, so a length check answers as Obsidian would', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      menu.addItem((item) => item.setTitle('First'));
      menu.addSeparator();
      menu.addItem((item) => item.setTitle('Second'));

      // This is the case the bridge exists for: production code contributing to a menu branches on
      // `menu.items.length`, and a mock that dropped separators gave it a different answer than Obsidian.
      expect(readItems(menu.asOriginalType2__())).toHaveLength(3);
    });

    it('should track the mock\'s own items__, so a later addition shows through the same getter', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      const original = menu.asOriginalType2__();
      expect(readItems(original)).toHaveLength(0);

      menu.addItem((item) => item.setTitle('Added later'));
      expect(readItems(original)).toHaveLength(1);
    });
  });

  describe('setSectionSubmenu', () => {
    it('should record the section\'s submenu config', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      callSetSectionSubmenu(menu.asOriginalType2__(), 'Patterns', 'lucide-wand', 'Patterns');

      expect(menu.sectionSubmenus__.get('Patterns')).toEqual({ icon: 'lucide-wand', title: 'Patterns' });
    });

    it('should return the menu so calls can chain', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      const original = menu.asOriginalType2__();

      expect(Menu.fromOriginalType2__(callSetSectionSubmenu(original, 'A', '', 'A'))).toBe(menu);
    });

    it('should overwrite the config when the same section is set twice', () => {
      bridgeMenu();
      const menu = Menu.create2__();
      const original = menu.asOriginalType2__();
      callSetSectionSubmenu(original, 'A', 'first', 'A');
      callSetSectionSubmenu(original, 'A', 'second', 'A');

      expect(menu.sectionSubmenus__.size).toBe(1);
      expect(menu.sectionSubmenus__.get('A')?.icon).toBe('second');
    });
  });

  describe('unbridgeMenu', () => {
    it('should remove both members', () => {
      bridgeMenu();
      unbridgeMenu();
      const menu = Menu.create2__();

      expect(() => readItems(menu.asOriginalType2__())).toThrow();
      expect(ensureGenericObject(Menu.prototype)['setSectionSubmenu']).toBeUndefined();
    });
  });
});

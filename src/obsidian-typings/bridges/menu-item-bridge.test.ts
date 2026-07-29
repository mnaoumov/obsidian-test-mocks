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
import { MenuItem } from '../../obsidian/MenuItem.ts';
import {
  bridgeMenuItem,
  unbridgeMenuItem
} from './menu-item-bridge.ts';

type SetSubmenuFn = (this: MenuItemOriginal) => MenuOriginal;

describe('menu-item-bridge', () => {
  afterEach(() => {
    unbridgeMenuItem();
  });

  function callSetSubmenu(item: MenuItemOriginal): MenuOriginal {
    const fn = ensureGenericObject(item)['setSubmenu'] as SetSubmenuFn;
    return fn.call(item);
  }

  function readSubmenu(item: MenuItemOriginal): unknown {
    return ensureGenericObject(item)['submenu'];
  }

  describe('setSubmenu', () => {
    it('should create the submenu and record it', () => {
      bridgeMenuItem();
      const item = MenuItem.create__(null);
      const submenu = callSetSubmenu(item.asOriginalType__());
      expect(Menu.fromOriginalType2__(submenu)).toBe(item.submenu__);
    });

    it('should return the same submenu on subsequent calls', () => {
      bridgeMenuItem();
      const original = MenuItem.create__(null).asOriginalType__();
      expect(callSetSubmenu(original)).toBe(callSetSubmenu(original));
    });
  });

  describe('submenu', () => {
    it('should be null until a submenu is created', () => {
      bridgeMenuItem();
      const item = MenuItem.create__(null);
      expect(readSubmenu(item.asOriginalType__())).toBeNull();
    });

    it('should return the created submenu', () => {
      bridgeMenuItem();
      const original = MenuItem.create__(null).asOriginalType__();
      const submenu = callSetSubmenu(original);
      expect(readSubmenu(original)).toBe(submenu);
    });
  });

  it('should support the submenu shape a plugin menu handler uses', () => {
    bridgeMenuItem();
    const menu = Menu.create2__();
    menu.addItem((item) => {
      item.setTitle('Blueprint');
      const submenu = callSetSubmenu(item);
      submenu.addItem((subItem) => {
        subItem.setTitle('New blueprint');
      });
    });

    const item = menu.items__[0];
    expect(item?.title__).toBe('Blueprint');
    expect(item?.submenu__?.items__.map((subItem) => subItem.title__)).toEqual(['New blueprint']);
  });

  it('should not overwrite if properties already exist', () => {
    bridgeMenuItem();
    bridgeMenuItem();
    const item = MenuItem.create__(null);
    const submenu = callSetSubmenu(item.asOriginalType__());
    expect(readSubmenu(item.asOriginalType__())).toBe(submenu);
  });

  it('should remove bridges on unbridge', () => {
    bridgeMenuItem();
    unbridgeMenuItem();
    expect('setSubmenu' in MenuItem.prototype).toBe(false);
    expect('submenu' in MenuItem.prototype).toBe(false);
  });
});

import type { MenuSeparator as MenuSeparatorOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Menu } from './Menu.ts';
import { MenuSeparator } from './MenuSeparator.ts';

describe('MenuSeparator', () => {
  it('should create an instance via create__', () => {
    const menu = Menu.create2__();
    const sep = MenuSeparator.create__(menu);
    expect(sep).toBeInstanceOf(MenuSeparator);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const menu = Menu.create2__();
      const sep = MenuSeparator.create__(menu);
      const original: MenuSeparatorOriginal = sep.asOriginalType__();
      expect(original).toBe(sep);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const menu = Menu.create2__();
      const sep = MenuSeparator.create__(menu);
      const mock = MenuSeparator.fromOriginalType__(sep.asOriginalType__());
      expect(mock).toBe(sep);
    });
  });
});

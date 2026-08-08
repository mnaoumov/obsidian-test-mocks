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
    const separator = MenuSeparator.create__(menu);
    expect(separator).toBeInstanceOf(MenuSeparator);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const menu = Menu.create2__();
      const separator = MenuSeparator.create__(menu);
      const original: MenuSeparatorOriginal = separator.asOriginalType__();
      expect(original).toBe(separator);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const menu = Menu.create2__();
      const separator = MenuSeparator.create__(menu);
      const mock = MenuSeparator.fromOriginalType__(separator.asOriginalType__());
      expect(mock).toBe(separator);
    });
  });
});

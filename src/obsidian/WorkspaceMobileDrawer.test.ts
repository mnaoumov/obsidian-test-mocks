import type { WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceMobileDrawer } from './WorkspaceMobileDrawer.ts';

describe('WorkspaceMobileDrawer', () => {
  it('should create an instance via create2__', () => {
    const drawer = WorkspaceMobileDrawer.create2__();
    expect(drawer).toBeInstanceOf(WorkspaceMobileDrawer);
  });

  describe('collapse()', () => {
    it('should set collapsed to true', () => {
      const drawer = WorkspaceMobileDrawer.create2__();
      drawer.collapse();
      expect(drawer.collapsed).toBe(true);
    });
  });

  describe('expand()', () => {
    it('should set collapsed to false', () => {
      const drawer = WorkspaceMobileDrawer.create2__();
      drawer.collapse();
      drawer.expand();
      expect(drawer.collapsed).toBe(false);
    });
  });

  describe('toggle()', () => {
    it('should toggle collapsed state', () => {
      const drawer = WorkspaceMobileDrawer.create2__();
      expect(drawer.collapsed).toBe(false);
      drawer.toggle();
      expect(drawer.collapsed).toBe(true);
      drawer.toggle();
      expect(drawer.collapsed).toBe(false);
    });
  });

  describe('asOriginalType4__()', () => {
    it('should return the same instance typed as the original', () => {
      const drawer = WorkspaceMobileDrawer.create2__();
      const original: WorkspaceMobileDrawerOriginal = drawer.asOriginalType4__();
      expect(original).toBe(drawer);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const drawer = WorkspaceMobileDrawer.create2__();
      const mock = WorkspaceMobileDrawer.fromOriginalType4__(drawer.asOriginalType4__());
      expect(mock).toBe(drawer);
    });
  });
});

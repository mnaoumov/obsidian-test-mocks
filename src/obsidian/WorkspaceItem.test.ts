import type { WorkspaceItem as WorkspaceItemOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

class BareWorkspaceItem extends WorkspaceItem {
  public constructor() {
    super();
  }
}

describe('WorkspaceItem', () => {
  describe('asOriginalType2__()', () => {
    it('should return the same instance typed as the original', () => {
      const item = WorkspaceFloating.create2__();
      const original: WorkspaceItemOriginal = item.asOriginalType2__();
      expect(original).toBe(item);
    });

    it('should return the same instance via WorkspaceItem base class', () => {
      const item = new BareWorkspaceItem();
      const original: WorkspaceItemOriginal = item.asOriginalType2__();
      expect(original).toBe(item);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const item = WorkspaceFloating.create2__();
      const mock = WorkspaceItem.fromOriginalType2__(item.asOriginalType2__());
      expect(mock).toBe(item);
    });
  });

  describe('parent', () => {
    it('should be assignable on concrete subclasses', () => {
      const item = WorkspaceFloating.create2__();
      const parent = WorkspaceFloating.create2__();
      item.parent = parent;
      expect(item.parent).toBe(parent);
    });
  });

  describe('getContainer()', () => {
    it('should return the instance cast as WorkspaceContainer', () => {
      const item = WorkspaceFloating.create2__();
      const container = item.getContainer();
      expect(container).toBe(item);
    });
  });

  describe('getRoot()', () => {
    it('should return the instance itself', () => {
      const item = WorkspaceFloating.create2__();
      const root = item.getRoot();
      expect(root).toBe(item);
    });
  });

  describe('constructor2__()', () => {
    it('should be callable without throwing', () => {
      const item = WorkspaceFloating.create2__();
      expect(() => {
        item.constructor2__();
      }).not.toThrow();
    });
  });
});

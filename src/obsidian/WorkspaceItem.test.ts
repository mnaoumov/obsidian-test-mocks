import type { WorkspaceItem as WorkspaceItemOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

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
    it('should return the nearest container ancestor', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(leaf.getContainer()).toBe(app.workspace.rootSplit);
    });

    it('should return a popout window for a leaf inside it', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.openPopoutLeaf();
      expect(leaf.getContainer()).toBeInstanceOf(WorkspaceWindow);
    });

    it('should return the item itself when it is a container', () => {
      const app = App.createConfigured__();
      expect(app.workspace.rootSplit.getContainer()).toBe(app.workspace.rootSplit);
    });

    it('should fall back to the root split when no ancestor is a container', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getContainer()).toBe(app.workspace.rootSplit);
    });

    it('should throw when there is no container and no workspace', () => {
      const item = WorkspaceFloating.create2__();
      expect(() => item.getContainer()).toThrow('The workspace item has no container ancestor and belongs to no workspace.');
    });
  });

  describe('getRoot()', () => {
    it('should return the instance itself when it has no parent', () => {
      const item = WorkspaceFloating.create2__();
      const root = item.getRoot();
      expect(root).toBe(item);
    });

    it('should return the topmost ancestor', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeftLeaf(false);
      expect(leaf?.getRoot()).toBe(app.workspace.leftSplit);
    });
  });

  describe('detach()', () => {
    it('should remove the item from its parent', () => {
      const parent = WorkspaceFloating.create2__();
      const item = WorkspaceFloating.create2__();
      parent.insertChild(0, item);
      item.detach();
      expect(parent.children).toEqual([]);
      expect(item.getRoot()).toBe(item);
    });

    it('should do nothing when the item has no parent', () => {
      const item = WorkspaceFloating.create2__();
      expect(() => {
        item.detach();
      }).not.toThrow();
    });
  });

  describe('setParent()', () => {
    it('should set the parent', () => {
      const parent = WorkspaceFloating.create2__();
      const item = WorkspaceFloating.create2__();
      item.setParent(parent.asOriginalType3__());
      expect(item.getRoot()).toBe(parent);
    });

    it('should leave the item without a parent when given null', () => {
      const parent = WorkspaceFloating.create2__();
      const item = WorkspaceFloating.create2__();
      item.setParent(parent.asOriginalType3__());
      item.setParent(null);
      expect(item.getRoot()).toBe(item);
      expect(() => item.parent.getRoot()).toThrow('is not mocked');
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

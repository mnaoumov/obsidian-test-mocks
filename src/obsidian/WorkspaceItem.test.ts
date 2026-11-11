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

const FULL_DIMENSION = 100;
const HALF_DIMENSION = FULL_DIMENSION / 2;

class BareWorkspaceItem extends WorkspaceItem {
  public type = 'bare';

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

  describe('containerEl', () => {
    it('should give each item a detached element of its own', () => {
      const first = WorkspaceFloating.create2__();
      const second = WorkspaceFloating.create2__();
      expect(first.containerEl).toBeInstanceOf(HTMLElement);
      expect(first.containerEl).not.toBe(second.containerEl);
      expect(first.containerEl.parentElement).toBeNull();
    });
  });

  describe('dimension / setDimension()', () => {
    it('should start without a share of its parent', () => {
      const item = WorkspaceFloating.create2__();
      expect(item.dimension).toBeNull();
    });

    it('should keep a share inside the open range', () => {
      const item = WorkspaceFloating.create2__();
      item.setDimension(HALF_DIMENSION);
      expect(item.dimension).toBe(HALF_DIMENSION);
    });

    it('should store a share outside the open range as null, as Obsidian does', () => {
      const item = WorkspaceFloating.create2__();
      item.setDimension(HALF_DIMENSION);

      item.setDimension(FULL_DIMENSION);
      expect(item.dimension).toBeNull();

      item.setDimension(HALF_DIMENSION);
      item.setDimension(0);
      expect(item.dimension).toBeNull();

      item.setDimension(HALF_DIMENSION);
      item.setDimension(-HALF_DIMENSION);
      expect(item.dimension).toBeNull();
    });

    it('should accept null', () => {
      const item = WorkspaceFloating.create2__();
      item.setDimension(HALF_DIMENSION);
      item.setDimension(null);
      expect(item.dimension).toBeNull();
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

  describe('id', () => {
    it('should keep the id given at construction', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app, 'given').id).toBe('given');
    });

    it('should generate a distinct id when none is given', () => {
      expect(new BareWorkspaceItem().id).not.toBe(new BareWorkspaceItem().id);
    });
  });

  describe('serialize()', () => {
    it('should record the id and type, and the dimension only when it has one', () => {
      const item = new BareWorkspaceItem();
      expect(item.serialize()).toEqual({ id: item.id, type: 'bare' });
      item.setDimension(40);
      expect(item.serialize()).toEqual({ dimension: 40, id: item.id, type: 'bare' });
    });
  });
});

import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

const OUT_OF_RANGE_INDEX = 10;
const HALF_DIMENSION = 50;

class BareWorkspaceParent extends WorkspaceParent {
  public constructor() {
    super();
  }
}

describe('WorkspaceParent', () => {
  describe('asOriginalType3__()', () => {
    it('should return the same instance typed as the original', () => {
      const parent = WorkspaceFloating.create2__();
      const original: WorkspaceParentOriginal = parent.asOriginalType3__();
      expect(original).toBe(parent);
    });

    it('should return the same instance via WorkspaceParent base class', () => {
      const parent = new BareWorkspaceParent();
      const original: WorkspaceParentOriginal = parent.asOriginalType3__();
      expect(original).toBe(parent);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const parent = WorkspaceFloating.create2__();
      const mock = WorkspaceParent.fromOriginalType3__(parent.asOriginalType3__());
      expect(mock).toBe(parent);
    });
  });

  describe('allowSingleChild', () => {
    it('should be false for a plain parent and true for a floating item', () => {
      expect(new BareWorkspaceParent().allowSingleChild).toBe(false);
      expect(WorkspaceFloating.create2__().allowSingleChild).toBe(true);
    });
  });

  describe('insertChild()', () => {
    it('should insert at the index and adopt the child', () => {
      const parent = new BareWorkspaceParent();
      const first = WorkspaceFloating.create2__();
      const second = WorkspaceFloating.create2__();
      parent.insertChild(0, second);
      parent.insertChild(0, first);
      expect(parent.children).toEqual([first, second]);
      expect(first.getRoot()).toBe(parent);
    });

    it('should append for a negative or out-of-range index', () => {
      const parent = new BareWorkspaceParent();
      const first = WorkspaceFloating.create2__();
      const second = WorkspaceFloating.create2__();
      const third = WorkspaceFloating.create2__();
      parent.insertChild(-1, first);
      parent.insertChild(OUT_OF_RANGE_INDEX, second);
      parent.insertChild(-1, third);
      expect(parent.children).toEqual([first, second, third]);
    });
  });

  describe('removeChild()', () => {
    it('should remove the child and release it', () => {
      const parent = new BareWorkspaceParent();
      const child = WorkspaceFloating.create2__();
      parent.insertChild(0, child);
      parent.removeChild(child);
      expect(parent.children).toEqual([]);
      expect(child.getRoot()).toBe(child);
    });

    it('should ignore a child it does not hold', () => {
      const parent = new BareWorkspaceParent();
      const child = WorkspaceFloating.create2__();
      const stranger = WorkspaceFloating.create2__();
      parent.insertChild(0, child);
      parent.removeChild(stranger);
      expect(parent.children).toEqual([child]);
    });

    it('should remove a parent left empty from its own parent', () => {
      const grandparent = new BareWorkspaceParent();
      const parent = WorkspaceFloating.create2__();
      const child = WorkspaceFloating.create2__();
      grandparent.insertChild(0, parent);
      parent.insertChild(0, child);
      parent.removeChild(child);
      expect(grandparent.children).toEqual([]);
    });

    it('should replace a parent left with a single child it may not keep by that child', () => {
      const grandparent = new BareWorkspaceParent();
      const parent = new BareWorkspaceParent();
      const kept = WorkspaceFloating.create2__();
      const removed = WorkspaceFloating.create2__();
      grandparent.insertChild(0, parent);
      parent.insertChild(0, kept);
      parent.insertChild(1, removed);
      parent.removeChild(removed);
      expect(grandparent.children).toEqual([kept]);
      expect(parent.children).toEqual([]);
      expect(kept.getRoot()).toBe(grandparent);
      expect(parent.getRoot()).toBe(parent);
    });

    it('should hand the replaced parent\'s share to the child that takes its place', () => {
      const grandparent = new BareWorkspaceParent();
      const parent = new BareWorkspaceParent();
      const kept = WorkspaceFloating.create2__();
      const removed = WorkspaceFloating.create2__();
      grandparent.insertChild(0, parent);
      parent.insertChild(0, kept);
      parent.insertChild(1, removed);
      parent.setDimension(HALF_DIMENSION);

      parent.removeChild(removed);

      expect(kept.dimension).toBe(HALF_DIMENSION);
    });

    it('should keep a single child when it may', () => {
      const grandparent = new BareWorkspaceParent();
      const parent = WorkspaceFloating.create2__();
      const kept = WorkspaceFloating.create2__();
      const removed = WorkspaceFloating.create2__();
      grandparent.insertChild(0, parent);
      parent.insertChild(0, kept);
      parent.insertChild(1, removed);
      parent.removeChild(removed);
      expect(grandparent.children).toEqual([parent]);
      expect(parent.children).toEqual([kept]);
    });
  });

  describe('replaceChild()', () => {
    it('should replace the child at the index', () => {
      const parent = new BareWorkspaceParent();
      const oldChild = WorkspaceFloating.create2__();
      const newChild = WorkspaceFloating.create2__();
      parent.insertChild(0, oldChild);
      parent.replaceChild(0, newChild);
      expect(parent.children).toEqual([newChild]);
      expect(oldChild.getRoot()).toBe(oldChild);
      expect(newChild.getRoot()).toBe(parent);
    });

    it('should clamp the index, appending past the end', () => {
      const parent = new BareWorkspaceParent();
      const first = WorkspaceFloating.create2__();
      const second = WorkspaceFloating.create2__();
      parent.replaceChild(-1, first);
      // eslint-disable-next-line unicorn/prefer-modern-dom-apis -- `WorkspaceParent.replaceChild` is Obsidian's layout method, not the DOM's; the autofix would rewrite it into a DOM `replaceWith` call.
      parent.replaceChild(OUT_OF_RANGE_INDEX, second);
      expect(parent.children).toEqual([first, second]);
    });
  });

  describe('constructor3__()', () => {
    it('should be callable without throwing', () => {
      const parent = WorkspaceFloating.create2__();
      expect(() => {
        parent.constructor3__();
      }).not.toThrow();
    });
  });
});

import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

class BareWorkspaceParent extends WorkspaceParent {
  public constructor() {
    super();
  }
}

describe('WorkspaceParent', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', () => {
      const parent = WorkspaceFloating.create2__();
      const original: WorkspaceParentOriginal = parent.asOriginalType__();
      expect(original).toBe(parent);
    });

    it('should return the same instance via WorkspaceParent base class', () => {
      const parent = new BareWorkspaceParent();
      const original: WorkspaceParentOriginal = parent.asOriginalType__();
      expect(original).toBe(parent);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const parent = WorkspaceFloating.create2__();
      const mock = WorkspaceParent.fromOriginalType__(parent.asOriginalType__());
      expect(mock).toBe(parent);
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

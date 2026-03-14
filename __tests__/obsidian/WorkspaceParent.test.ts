import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from '../../src/obsidian/WorkspaceFloating.ts';

describe('WorkspaceParent', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', () => {
      const parent = WorkspaceFloating.create2__();
      const original: WorkspaceParentOriginal = parent.asOriginalType__();
      expect(original).toBe(parent);
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

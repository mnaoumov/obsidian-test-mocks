import type { WorkspaceItem as WorkspaceItemOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from '../../src/obsidian/WorkspaceFloating.ts';

describe('WorkspaceItem', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', () => {
      const item = WorkspaceFloating.create2__();
      const original: WorkspaceItemOriginal = item.asOriginalType__();
      expect(original).toBe(item);
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
});

import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { WorkspaceFloating } from './WorkspaceFloating.ts';

describe('WorkspaceFloating', () => {
  it('should create an instance via create2__', () => {
    const floating = WorkspaceFloating.create2__();
    expect(floating).toBeInstanceOf(WorkspaceFloating);
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', () => {
      const floating = WorkspaceFloating.create2__();
      const original: WorkspaceFloatingOriginal = floating.asOriginalType__();
      expect(original).toBe(floating);
    });
  });
});

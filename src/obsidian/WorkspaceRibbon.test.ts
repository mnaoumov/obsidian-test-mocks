import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';

describe('WorkspaceRibbon', () => {
  it('should create an instance via create__', () => {
    const app = App.createConfigured__();
    const ribbon = WorkspaceRibbon.create__(app.workspace, 'left');
    expect(ribbon).toBeInstanceOf(WorkspaceRibbon);
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const ribbon = WorkspaceRibbon.create__(app.workspace, 'left');
      const original: WorkspaceRibbonOriginal = ribbon.asOriginalType__();
      expect(original).toBe(ribbon);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const ribbon = WorkspaceRibbon.create__(app.workspace, 'left');
      const mock = WorkspaceRibbon.fromOriginalType__(ribbon.asOriginalType__());
      expect(mock).toBe(ribbon);
    });
  });
});

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

  describe('load()', () => {
    it('should accept a saved state without throwing', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.workspace.leftRibbon.load({ hiddenItems: { item: true } });
      }).not.toThrow();
    });
  });

  describe('serialize()', () => {
    it('should report no hidden items for a ribbon that holds none', () => {
      const app = App.createConfigured__();
      expect(app.workspace.leftRibbon.serialize()).toEqual({ hiddenItems: {} });
    });
  });
});

import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceTabs } from './WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create2__', () => {
    const app = App.createConfigured__();
    const tabs = WorkspaceTabs.create2__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });

  describe('asOriginalType4__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const original: WorkspaceTabsOriginal = tabs.asOriginalType4__();
      expect(original).toBe(tabs);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const mock = WorkspaceTabs.fromOriginalType4__(tabs.asOriginalType4__());
      expect(mock).toBe(tabs);
    });
  });
});

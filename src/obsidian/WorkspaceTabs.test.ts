import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceTabs } from './WorkspaceTabs.ts';

describe('WorkspaceTabs', () => {
  it('should create an instance via create2__', async () => {
    const app = await App.createConfigured__();
    const tabs = WorkspaceTabs.create2__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const original: WorkspaceTabsOriginal = tabs.asOriginalType__();
      expect(original).toBe(tabs);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const mock = WorkspaceTabs.fromOriginalType__(tabs.asOriginalType__());
      expect(mock).toBe(tabs);
    });
  });
});

import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceWindow } from '../../src/obsidian/WorkspaceWindow.ts';

describe('WorkspaceWindow', () => {
  it('should create an instance via create3__', async () => {
    const app = await App.createConfigured__();
    const win = WorkspaceWindow.create3__(app.workspace);
    expect(win).toBeInstanceOf(WorkspaceWindow);
  });

  describe('doc', () => {
    it('should return the document', async () => {
      const app = await App.createConfigured__();
      const win = WorkspaceWindow.create3__(app.workspace);
      expect(win.doc).toBe(document);
    });
  });

  describe('win', () => {
    it('should return the window', async () => {
      const app = await App.createConfigured__();
      const win = WorkspaceWindow.create3__(app.workspace);
      expect(win.win).toBe(window);
    });
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const win = WorkspaceWindow.create3__(app.workspace);
      const original: WorkspaceWindowOriginal = win.asOriginalType__();
      expect(original).toBe(win);
    });
  });
});

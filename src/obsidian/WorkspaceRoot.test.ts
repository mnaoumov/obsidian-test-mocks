import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';

describe('WorkspaceRoot', () => {
  it('should create an instance via create3__', async () => {
    const app = await App.createConfigured__();
    const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
    expect(root).toBeInstanceOf(WorkspaceRoot);
  });

  describe('doc', () => {
    it('should return the document', async () => {
      const app = await App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(root.doc).toBe(document);
    });
  });

  describe('win', () => {
    it('should return the window', async () => {
      const app = await App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(root.win).toBe(window);
    });
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const original: WorkspaceRootOriginal = root.asOriginalType__();
      expect(original).toBe(root);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const mock = WorkspaceRoot.fromOriginalType__(root.asOriginalType__());
      expect(mock).toBe(root);
    });
  });
});

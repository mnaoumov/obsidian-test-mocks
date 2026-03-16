import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';

describe('WorkspaceRoot', () => {
  it('should create an instance via create3__', () => {
    const app = App.createConfigured__();
    const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
    expect(root).toBeInstanceOf(WorkspaceRoot);
  });

  describe('doc', () => {
    it('should return the document', () => {
      const app = App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(root.doc).toBe(document);
    });
  });

  describe('win', () => {
    it('should return the window', () => {
      const app = App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(root.win).toBe(window);
    });
  });

  describe('asOriginalType6__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const original: WorkspaceRootOriginal = root.asOriginalType6__();
      expect(original).toBe(root);
    });
  });

  describe('fromOriginalType6__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const root = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const mock = WorkspaceRoot.fromOriginalType6__(root.asOriginalType6__());
      expect(mock).toBe(root);
    });
  });
});

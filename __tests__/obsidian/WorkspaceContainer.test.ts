import type { WorkspaceContainer as WorkspaceContainerOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceRoot } from '../../src/obsidian/WorkspaceRoot.ts';

describe('WorkspaceContainer', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const container = WorkspaceRoot.create3__(app.workspace, 'vertical');
      const original: WorkspaceContainerOriginal = container.asOriginalType__();
      expect(original).toBe(container);
    });
  });

  describe('constructor5__()', () => {
    it('should be callable without throwing', async () => {
      const app = await App.createConfigured__();
      const container = WorkspaceRoot.create3__(app.workspace, 'vertical');
      expect(() => {
        container.constructor5__(app.workspace, 'vertical');
      }).not.toThrow();
    });
  });
});

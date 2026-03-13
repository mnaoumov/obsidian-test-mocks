import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceLeaf } from '../../src/obsidian/WorkspaceLeaf.ts';

describe('WorkspaceLeaf', () => {
  describe('detach', () => {
    it('should remove the leaf from workspace leaves', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const countBefore = countLeaves(app);
      expect(hasLeaf(app, leaf)).toBe(true);

      leaf.detach();

      expect(hasLeaf(app, leaf)).toBe(false);
      expect(countLeaves(app)).toBe(countBefore - 1);
    });

    it('should clear activeLeaf if detached leaf was active', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      expect(app.workspace.activeLeaf).toBe(leaf);

      leaf.detach();

      expect(app.workspace.activeLeaf).toBeNull();
    });

    it('should not affect activeLeaf if detached leaf was not active', async () => {
      const app = await App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf1);

      leaf2.detach();

      expect(app.workspace.activeLeaf).toBe(leaf1);
    });
  });
});

function countLeaves(app: App): number {
  let count = 0;
  app.workspace.iterateAllLeaves(() => {
    count++;
  });
  return count;
}

function hasLeaf(app: App, leaf: WorkspaceLeaf): boolean {
  let found = false;
  app.workspace.iterateAllLeaves((l) => {
    if (l === leaf) {
      found = true;
    }
  });
  return found;
}

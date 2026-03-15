import type { WorkspaceLeaf as WorkspaceLeafOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

describe('WorkspaceLeaf', () => {
  describe('create2__()', () => {
    it('should create an instance', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should assign an auto-incrementing id', async () => {
      const app = await App.createConfigured__();
      const leaf1 = WorkspaceLeaf.create2__(app);
      const leaf2 = WorkspaceLeaf.create2__(app);
      expect(leaf1.id__).not.toBe(leaf2.id__);
    });

    it('should use the provided id', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app, 'custom-id');
      expect(leaf.id__).toBe('custom-id');
    });
  });

  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const original: WorkspaceLeafOriginal = leaf.asOriginalType__();
      expect(original).toBe(leaf);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const mock = WorkspaceLeaf.fromOriginalType__(leaf.asOriginalType__());
      expect(mock).toBe(leaf);
    });
  });

  describe('detach()', () => {
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

  describe('getDisplayText()', () => {
    it('should return empty string when no view', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getDisplayText()).toBe('');
    });

    it('should return the view display text when view is set', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.view = { getDisplayText: () => 'My View', getIcon: () => '', onResize: vi.fn() } as never;
      expect(leaf.getDisplayText()).toBe('My View');
    });
  });

  describe('getEphemeralState() / setEphemeralState()', () => {
    it('should return an empty object by default', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getEphemeralState()).toEqual({});
    });

    it('should set and get ephemeral state', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const SCROLL_VALUE = 42;
      leaf.setEphemeralState({ scroll: SCROLL_VALUE });
      expect(leaf.getEphemeralState()).toEqual({ scroll: SCROLL_VALUE });
    });

    it('should return a copy, not the same object', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setEphemeralState({ key: 'value' });
      const state1 = leaf.getEphemeralState();
      const state2 = leaf.getEphemeralState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('getGroup__() / setGroup()', () => {
    it('should return null by default', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getGroup__()).toBeNull();
    });

    it('should set and return the group', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setGroup('my-group');
      expect(leaf.getGroup__()).toBe('my-group');
    });
  });

  describe('getIcon()', () => {
    it('should return empty string when no view', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getIcon()).toBe('');
    });

    it('should return the view icon when view is set', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.view = { getDisplayText: () => '', getIcon: () => 'star', onResize: vi.fn() } as never;
      expect(leaf.getIcon()).toBe('star');
    });
  });

  describe('getViewState() / setViewState()', () => {
    it('should return default view state', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getViewState()).toEqual({ type: '' });
    });

    it('should set and get view state', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'markdown' });
      expect(leaf.getViewState()).toEqual({ type: 'markdown' });
    });

    it('should set ephemeral state when provided', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'markdown' }, { scroll: 0 });
      expect(leaf.getEphemeralState()).toEqual({ scroll: 0 });
    });

    it('should trigger view-state-change event', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const handler = vi.fn();
      leaf.on('view-state-change', handler);
      await leaf.setViewState({ type: 'markdown' });
      expect(handler).toHaveBeenCalled();
    });

    it('should return a copy, not the same object', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'test' });
      const state1 = leaf.getViewState();
      const state2 = leaf.getViewState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('isPinned__() / setPinned() / togglePinned()', () => {
    it('should not be pinned by default', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.isPinned__()).toBe(false);
    });

    it('should set pinned state', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setPinned(true);
      expect(leaf.isPinned__()).toBe(true);
    });

    it('should toggle pinned state', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.togglePinned();
      expect(leaf.isPinned__()).toBe(true);
      leaf.togglePinned();
      expect(leaf.isPinned__()).toBe(false);
    });
  });

  describe('loadIfDeferred()', () => {
    it('should resolve without throwing', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await expect(leaf.loadIfDeferred()).resolves.toBeUndefined();
    });
  });

  describe('onResize()', () => {
    it('should not throw when no view', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(() => {
        leaf.onResize();
      }).not.toThrow();
    });

    it('should call view.onResize when view is set', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const onResize = vi.fn();
      leaf.view = { getDisplayText: () => '', getIcon: () => '', onResize } as never;
      leaf.onResize();
      expect(onResize).toHaveBeenCalled();
    });
  });

  describe('openFile()', () => {
    it('should set the file', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const file = app.vault.getFileByPath('note.md');
      if (file) {
        await leaf.openFile(file);
      }
      expect(leaf.file__).toBe(file);
    });
  });

  describe('file__', () => {
    it('should return null by default', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.file__).toBeNull();
    });
  });

  describe('setGroupMember()', () => {
    it('should set the group to match another leaf', async () => {
      const app = await App.createConfigured__();
      const leaf1 = WorkspaceLeaf.create2__(app);
      const leaf2 = WorkspaceLeaf.create2__(app);
      leaf1.setGroup('shared');
      leaf2.setGroupMember(leaf1);
      expect(leaf2.getGroup__()).toBe('shared');
    });
  });

  describe('isDeferred', () => {
    it('should be false', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.isDeferred).toBe(false);
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

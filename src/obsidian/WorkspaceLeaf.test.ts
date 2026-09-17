import type {
  View,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

const EXPECTED_SAVE_COUNT = 2;

describe('WorkspaceLeaf', () => {
  describe('create2__()', () => {
    it('should create an instance', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should assign an auto-incrementing id', () => {
      const app = App.createConfigured__();
      const leaf1 = WorkspaceLeaf.create2__(app);
      const leaf2 = WorkspaceLeaf.create2__(app);
      expect(leaf1.id__).not.toBe(leaf2.id__);
    });

    it('should use the provided id', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app, 'custom-id');
      expect(leaf.id__).toBe('custom-id');
    });
  });

  describe('asOriginalType3__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const original: WorkspaceLeafOriginal = leaf.asOriginalType3__();
      expect(original).toBe(leaf);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const mock = WorkspaceLeaf.fromOriginalType3__(leaf.asOriginalType3__());
      expect(mock).toBe(leaf);
    });
  });

  describe('detach()', () => {
    it('should remove the leaf from its parent', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.detach();
      expect(leaf.getRoot()).toBe(leaf);
    });

    it('should remove the leaf from workspace leaves', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const countBefore = countLeaves(app);
      expect(hasLeaf(app, leaf)).toBe(true);

      leaf.detach();

      expect(hasLeaf(app, leaf)).toBe(false);
      expect(countLeaves(app)).toBe(countBefore - 1);
    });

    it('should clear activeLeaf if detached leaf was active', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      expect(app.workspace.activeLeaf).toBe(leaf);

      leaf.detach();

      expect(app.workspace.activeLeaf).toBeNull();
    });

    it('should not affect activeLeaf if detached leaf was not active', () => {
      const app = App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf1);

      leaf2.detach();

      expect(app.workspace.activeLeaf).toBe(leaf1);
    });
  });

  describe('getDisplayText()', () => {
    it('should return empty string when no view', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getDisplayText()).toBe('');
    });

    it('should return the view display text when view is set', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.view = strictProxy<View>({ getDisplayText: () => 'My View', getIcon: () => '', onResize: vi.fn() });
      expect(leaf.getDisplayText()).toBe('My View');
    });
  });

  describe('getEphemeralState() / setEphemeralState()', () => {
    it('should return an empty object by default', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getEphemeralState()).toEqual({});
    });

    it('should set and get ephemeral state', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const SCROLL_VALUE = 42;
      leaf.setEphemeralState({ scroll: SCROLL_VALUE });
      expect(leaf.getEphemeralState()).toEqual({ scroll: SCROLL_VALUE });
    });

    it('should return a copy, not the same object', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setEphemeralState({ key: 'value' });
      const state1 = leaf.getEphemeralState();
      const state2 = leaf.getEphemeralState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('getGroup__() / setGroup()', () => {
    it('should return null by default', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getGroup__()).toBeNull();
    });

    it('should set and return the group', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setGroup('my-group');
      expect(leaf.getGroup__()).toBe('my-group');
    });

    it('should trigger group-change with the new group', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const handler = vi.fn();
      leaf.on('group-change', handler);
      leaf.setGroup('my-group');
      expect(handler).toHaveBeenCalledExactlyOnceWith('my-group');
    });

    it('should do nothing when the group is unchanged', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setGroup('my-group');
      const handler = vi.fn();
      leaf.on('group-change', handler);
      leaf.on('pinned-change', handler);
      leaf.setGroup('my-group');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should pin the leaf when a leaf already in the group is pinned', () => {
      const app = App.createConfigured__();
      const pinnedLeaf = app.workspace.getLeaf(true);
      const leaf = app.workspace.getLeaf(true);
      pinnedLeaf.setGroup('my-group');
      pinnedLeaf.setPinned(true);
      leaf.setGroup('my-group');
      expect(leaf.isPinned__()).toBe(true);
    });

    it('should keep a pinned leaf pinned when it leaves a group', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setGroup('my-group');
      leaf.setPinned(true);
      leaf.setGroup(null);
      expect(leaf.isPinned__()).toBe(true);
      expect(leaf.getGroup__()).toBeNull();
    });
  });

  describe('getIcon()', () => {
    it('should return empty string when no view', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getIcon()).toBe('');
    });

    it('should return the view icon when view is set', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.view = strictProxy<View>({ getDisplayText: () => '', getIcon: () => 'star', onResize: vi.fn() });
      expect(leaf.getIcon()).toBe('star');
    });
  });

  describe('getViewState() / setViewState()', () => {
    it('should return default view state', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.getViewState()).toEqual({ type: '' });
    });

    it('should set and get view state', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'markdown' });
      expect(leaf.getViewState()).toEqual({ type: 'markdown' });
    });

    it('should set ephemeral state when provided', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'markdown' }, { scroll: 0 });
      expect(leaf.getEphemeralState()).toEqual({ scroll: 0 });
    });

    it('should trigger view-state-change event', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const handler = vi.fn();
      leaf.on('view-state-change', handler);
      await leaf.setViewState({ type: 'markdown' });
      expect(handler).toHaveBeenCalled();
    });

    it('should return a copy, not the same object', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'test' });
      const state1 = leaf.getViewState();
      const state2 = leaf.getViewState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('isPinned__() / setPinned() / togglePinned()', () => {
    it('should not be pinned by default', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.isPinned__()).toBe(false);
    });

    it('should set pinned state', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setPinned(true);
      expect(leaf.isPinned__()).toBe(true);
    });

    it('should toggle pinned state', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.togglePinned();
      expect(leaf.isPinned__()).toBe(true);
      leaf.togglePinned();
      expect(leaf.isPinned__()).toBe(false);
    });

    it('should trigger pinned-change with the new flag and request a layout save', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const handler = vi.fn();
      const saveSpy = vi.spyOn(app.workspace, 'requestSaveLayout');
      leaf.on('pinned-change', handler);
      leaf.setPinned(true);
      leaf.togglePinned();
      expect(handler.mock.calls).toEqual([[true], [false]]);
      expect(saveSpy).toHaveBeenCalledTimes(EXPECTED_SAVE_COUNT);
    });

    it('should pin and unpin the other leaves in its group', () => {
      const app = App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      const outsider = app.workspace.getLeaf(true);
      leaf1.setGroup('my-group');
      leaf2.setGroup('my-group');
      leaf1.setPinned(true);
      expect(leaf2.isPinned__()).toBe(true);
      expect(outsider.isPinned__()).toBe(false);
      leaf2.setPinned(false);
      expect(leaf1.isPinned__()).toBe(false);
    });
  });

  describe('loadIfDeferred()', () => {
    it('should resolve without throwing', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await expect(leaf.loadIfDeferred()).resolves.toBeUndefined();
    });
  });

  describe('onResize()', () => {
    it('should not throw when no view', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(() => {
        leaf.onResize();
      }).not.toThrow();
    });

    it('should call view.onResize when view is set', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const onResize = vi.fn();
      leaf.view = strictProxy<View>({ getDisplayText: () => '', getIcon: () => '', onResize });
      leaf.onResize();
      expect(onResize).toHaveBeenCalled();
    });
  });

  describe('open()', () => {
    it('should set the view and return it', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = strictProxy<View>({});
      const result = await leaf.open(view);
      expect(result).toBe(view);
      expect(leaf.view).toBe(view);
    });
  });

  describe('openFile()', () => {
    it('should set the file', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const file = app.vault.getFileByPath('note.md');
      if (file) {
        await leaf.openFile(file);
      }
      expect(leaf.file__).toBe(file);
    });
  });

  describe('file__', () => {
    it('should return null by default', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.file__).toBeNull();
    });
  });

  describe('setGroupMember()', () => {
    it('should set the group to match another leaf', () => {
      const app = App.createConfigured__();
      const leaf1 = WorkspaceLeaf.create2__(app);
      const leaf2 = WorkspaceLeaf.create2__(app);
      leaf1.setGroup('shared');
      leaf2.setGroupMember(leaf1);
      expect(leaf2.getGroup__()).toBe('shared');
    });

    it('should first put a leaf in no group into a new one', () => {
      const app = App.createConfigured__();
      const leaf1 = WorkspaceLeaf.create2__(app);
      const leaf2 = WorkspaceLeaf.create2__(app);
      leaf2.setGroupMember(leaf1);
      expect(leaf1.getGroup__()).toMatch(/^[\da-f]{16}$/u);
      expect(leaf2.getGroup__()).toBe(leaf1.getGroup__());
    });

    it('should do nothing when given the leaf itself', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setGroupMember(leaf);
      expect(leaf.getGroup__()).toBeNull();
    });

    it('should leave the group when given null', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setGroup('shared');
      leaf.setGroupMember(null);
      expect(leaf.getGroup__()).toBeNull();
    });
  });

  describe('isDeferred', () => {
    it('should be false', () => {
      const app = App.createConfigured__();
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
  let isFound = false;
  app.workspace.iterateAllLeaves((l) => {
    if (l === leaf) {
      isFound = true;
    }
  });
  return isFound;
}

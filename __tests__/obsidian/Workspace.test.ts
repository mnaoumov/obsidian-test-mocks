import type { Workspace as WorkspaceOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { WorkspaceLeaf } from '../../src/obsidian/WorkspaceLeaf.ts';
import { WorkspaceWindow } from '../../src/obsidian/WorkspaceWindow.ts';

const EXPECTED_LEAF_COUNT = 2;

describe('Workspace', () => {
  describe('asOriginalType__()', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const original: WorkspaceOriginal = app.workspace.asOriginalType__();
      expect(original).toBe(app.workspace);
    });
  });

  describe('changeLayout()', () => {
    it('should resolve without throwing', async () => {
      const app = await App.createConfigured__();
      await expect(app.workspace.changeLayout({})).resolves.toBeUndefined();
    });
  });

  describe('createLeafBySplit()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf);
      expect(newLeaf).toBeInstanceOf(WorkspaceLeaf);
      expect(newLeaf).not.toBe(existingLeaf);
    });
  });

  describe('createLeafInParent()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const newLeaf = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType__(), 0);
      expect(newLeaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('detachLeavesOfType()', () => {
    it('should detach leaves matching the given view type', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ type: 'markdown' });
      app.workspace.detachLeavesOfType('markdown');
      expect(app.workspace.getLeavesOfType('markdown').length).toBe(0);
    });

    it('should not detach leaves of other types', async () => {
      const app = await App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      await leaf1.setViewState({ type: 'markdown' });
      const leaf2 = app.workspace.getLeaf(true);
      await leaf2.setViewState({ type: 'canvas' });
      app.workspace.detachLeavesOfType('markdown');
      expect(app.workspace.getLeavesOfType('canvas').length).toBe(1);
    });
  });

  describe('duplicateLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const dup = await app.workspace.duplicateLeaf(leaf);
      expect(dup).toBeInstanceOf(WorkspaceLeaf);
      expect(dup).not.toBe(leaf);
    });
  });

  describe('ensureSideLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = await app.workspace.ensureSideLeaf('test', 'left');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('getActiveFile()', () => {
    it('should return null when no active leaf', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.getActiveFile()).toBeNull();
    });

    it('should return the file from the active leaf', async () => {
      const app = await App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      const file = app.vault.getFileByPath('note.md');
      if (file) {
        await leaf.openFile(file);
      }
      app.workspace.setActiveLeaf(leaf);
      expect(app.workspace.getActiveFile()).toBe(file);
    });
  });

  describe('getActiveViewOfType()', () => {
    it('should return null', async () => {
      const app = await App.createConfigured__();
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Need a constructor for testing.
      class DummyView {}
      expect(app.workspace.getActiveViewOfType(DummyView as never)).toBeNull();
    });
  });

  describe('getGroupLeaves()', () => {
    it('should return leaves in the given group', async () => {
      const app = await App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      leaf1.setGroup('my-group');
      leaf2.setGroup('my-group');
      const result = app.workspace.getGroupLeaves('my-group');
      expect(result).toContain(leaf1);
      expect(result).toContain(leaf2);
    });

    it('should not return leaves from other groups', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setGroup('other');
      const result = app.workspace.getGroupLeaves('my-group');
      expect(result).not.toContain(leaf);
    });
  });

  describe('getLastOpenFiles()', () => {
    it('should return an empty array', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.getLastOpenFiles()).toEqual([]);
    });
  });

  describe('getLayout()', () => {
    it('should return an empty object', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.getLayout()).toEqual({});
    });
  });

  describe('getLeaf()', () => {
    it('should return a new leaf when newLeaf is true', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "tab"', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf('tab');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "split"', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf('split');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "window"', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf('window');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return active leaf when it exists and newLeaf is false', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      const result = app.workspace.getLeaf(false);
      expect(result).toBe(leaf);
    });

    it('should create and set active leaf when none exists and newLeaf is false', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
      expect(app.workspace.activeLeaf).toBe(leaf);
    });
  });

  describe('getLeafById()', () => {
    it('should return the leaf with the given id', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const result = app.workspace.getLeafById(leaf.id__);
      expect(result).toBe(leaf);
    });

    it('should return null for unknown id', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.getLeafById('nonexistent')).toBeNull();
    });
  });

  describe('getLeavesOfType()', () => {
    it('should return leaves matching the view type', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ type: 'markdown' });
      const result = app.workspace.getLeavesOfType('markdown');
      expect(result).toContain(leaf);
    });

    it('should not return leaves of different types', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ type: 'canvas' });
      const result = app.workspace.getLeavesOfType('markdown');
      expect(result).not.toContain(leaf);
    });
  });

  describe('getLeftLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeftLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('getMostRecentLeaf()', () => {
    it('should return null when no leaves', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.getMostRecentLeaf()).toBeNull();
    });

    it('should return the last leaf', async () => {
      const app = await App.createConfigured__();
      app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      expect(app.workspace.getMostRecentLeaf()).toBe(leaf2);
    });
  });

  describe('getRightLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getRightLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('getUnpinnedLeaf()', () => {
    it('should return an existing unpinned leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(app.workspace.getUnpinnedLeaf()).toBe(leaf);
    });

    it('should create a new leaf when all are pinned', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setPinned(true);
      const unpinned = app.workspace.getUnpinnedLeaf();
      expect(unpinned).not.toBe(leaf);
      expect(unpinned).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('iterateAllLeaves()', () => {
    it('should iterate over all leaves', async () => {
      const app = await App.createConfigured__();
      app.workspace.getLeaf(true);
      app.workspace.getLeaf(true);
      const leaves: WorkspaceLeaf[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leaves.push(l);
      });
      expect(leaves.length).toBe(EXPECTED_LEAF_COUNT);
    });
  });

  describe('iterateRootLeaves()', () => {
    it('should iterate over all leaves', async () => {
      const app = await App.createConfigured__();
      app.workspace.getLeaf(true);
      const leaves: WorkspaceLeaf[] = [];
      app.workspace.iterateRootLeaves((l) => {
        leaves.push(l);
      });
      expect(leaves.length).toBe(1);
    });
  });

  describe('moveLeafToPopout()', () => {
    it('should return a WorkspaceWindow', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const win = app.workspace.moveLeafToPopout(leaf);
      expect(win).toBeInstanceOf(WorkspaceWindow);
    });

    it('should add the leaf if not already tracked', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      app.workspace.moveLeafToPopout(leaf);
      const leaves: WorkspaceLeaf[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leaves.push(l);
      });
      expect(leaves).toContain(leaf);
    });
  });

  describe('onLayoutReady()', () => {
    it('should invoke callback immediately if layout is ready', async () => {
      const app = await App.createConfigured__();
      app.workspace.setLayoutReady__();
      const callback = vi.fn();
      app.workspace.onLayoutReady(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should defer callback until layout becomes ready', async () => {
      const app = await App.createConfigured__();
      const callback = vi.fn();
      app.workspace.onLayoutReady(callback);
      expect(callback).not.toHaveBeenCalled();
      app.workspace.setLayoutReady__();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('openLinkText()', () => {
    it('should open a file matching the link text', async () => {
      const app = await App.createConfigured__({
        files: { 'notes/hello.md': 'content' }
      });

      await app.workspace.openLinkText('hello', 'notes/other.md');

      const allLeaves: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        allLeaves.push(l);
      });
      expect(allLeaves.length).toBeGreaterThanOrEqual(1);
    });

    it('should resolve link using metadataCache', async () => {
      const app = await App.createConfigured__({
        files: {
          'folder/note.md': 'content',
          'folder/source.md': ''
        }
      });

      await app.workspace.openLinkText('note', 'folder/source.md');

      const file = app.workspace.getActiveFile();
      expect(file?.path).toBe('folder/note.md');
    });

    it('should create a new leaf when newLeaf is true', async () => {
      const app = await App.createConfigured__({
        files: { 'test.md': '' }
      });
      const leavesBefore: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesBefore.push(l);
      });

      await app.workspace.openLinkText('test', '', true);

      const leavesAfter: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesAfter.push(l);
      });
      expect(leavesAfter.length).toBe(leavesBefore.length + 1);
    });

    it('should do nothing when link cannot be resolved', async () => {
      const app = await App.createConfigured__();
      const leavesBefore: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesBefore.push(l);
      });

      await app.workspace.openLinkText('nonexistent', '');

      const leavesAfter: unknown[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leavesAfter.push(l);
      });
      expect(leavesAfter.length).toBe(leavesBefore.length);
    });
  });

  describe('openPopoutLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.openPopoutLeaf();
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('removeLeaf__()', () => {
    it('should remove the leaf from the workspace', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.removeLeaf__(leaf);
      const leaves: WorkspaceLeaf[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leaves.push(l);
      });
      expect(leaves).not.toContain(leaf);
    });

    it('should clear activeLeaf if it matches', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      app.workspace.removeLeaf__(leaf);
      expect(app.workspace.activeLeaf).toBeNull();
    });

    it('should not clear activeLeaf if it does not match', async () => {
      const app = await App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf1);
      app.workspace.removeLeaf__(leaf2);
      expect(app.workspace.activeLeaf).toBe(leaf1);
    });
  });

  describe('revealLeaf()', () => {
    it('should set the leaf as active', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await app.workspace.revealLeaf(leaf);
      expect(app.workspace.activeLeaf).toBe(leaf);
    });
  });

  describe('setActiveLeaf()', () => {
    it('should set the active leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should add the leaf if not tracked', async () => {
      const app = await App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      app.workspace.setActiveLeaf(leaf);
      const leaves: WorkspaceLeaf[] = [];
      app.workspace.iterateAllLeaves((l) => {
        leaves.push(l);
      });
      expect(leaves).toContain(leaf);
    });

    it('should trigger active-leaf-change event', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const handler = vi.fn();
      app.workspace.on('active-leaf-change', handler);
      app.workspace.setActiveLeaf(leaf);
      expect(handler).toHaveBeenCalledWith(leaf);
    });
  });

  describe('setLayoutReady__()', () => {
    it('should set layoutReady to true', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.layoutReady).toBe(false);
      app.workspace.setLayoutReady__();
      expect(app.workspace.layoutReady).toBe(true);
    });

    it('should invoke and clear pending callbacks', async () => {
      const app = await App.createConfigured__();
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      app.workspace.onLayoutReady(cb1);
      app.workspace.onLayoutReady(cb2);
      app.workspace.setLayoutReady__();
      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
      // Calling again should not re-invoke
      cb1.mockClear();
      app.workspace.setLayoutReady__();
      expect(cb1).not.toHaveBeenCalled();
    });
  });

  describe('splitActiveLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = await App.createConfigured__();
      const leaf = app.workspace.splitActiveLeaf();
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });
  });

  describe('updateOptions()', () => {
    it('should not throw', async () => {
      const app = await App.createConfigured__();
      expect(() => {
        app.workspace.updateOptions();
      }).not.toThrow();
    });
  });

  describe('requestSaveLayout', () => {
    it('should be a function', async () => {
      const app = await App.createConfigured__();
      expect(typeof app.workspace.requestSaveLayout).toBe('function');
    });
  });

  describe('containerEl', () => {
    it('should be an HTMLElement', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.containerEl).toBeInstanceOf(HTMLElement);
    });
  });

  describe('rootSplit', () => {
    it('should be defined', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.rootSplit).toBeDefined();
    });
  });

  describe('leftSplit', () => {
    it('should be defined', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.leftSplit).toBeDefined();
    });
  });

  describe('rightSplit', () => {
    it('should be defined', async () => {
      const app = await App.createConfigured__();
      expect(app.workspace.rightSplit).toBeDefined();
    });
  });
});

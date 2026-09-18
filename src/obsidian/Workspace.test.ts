import type {
  Constructor as ConstructorOriginal,
  Menu as MenuOriginal,
  View as ViewOriginal,
  Workspace as WorkspaceOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from '../internal/castTo.ts';
import { noopAsync } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { View } from './View.ts';
import { Workspace } from './Workspace.ts';
import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';
import { WorkspaceTabs } from './WorkspaceTabs.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

const EXPECTED_LEAF_COUNT = 2;
const THREE_LEAVES = 3;
const OUT_OF_RANGE_INDEX = 10;
const EPHEMERAL_LINE = 3;
const FULL_DIMENSION = 100;
const HALF_DIMENSION = FULL_DIMENSION / 2;
const THIRD_DIMENSION = FULL_DIMENSION / 3;
const QUARTER_DIMENSION = HALF_DIMENSION / 2;

// Held on an object so each filled tab gets a file of its own without assigning to a module-level binding.
const filledTabCounter = { next: 1 };

class BareWorkspaceItem extends WorkspaceItem {
  public constructor() {
    super();
  }
}

class DummyView extends View {
  public override getDisplayText(): string {
    return 'DummyView';
  }

  public override getViewType(): string {
    return 'DummyView';
  }
}

class OtherView extends View {
  public override getDisplayText(): string {
    return 'OtherView';
  }

  public override getViewType(): string {
    return 'OtherView';
  }
}

/**
 * Adds leaves to the root tab group without activating any of them, which every leaf-creating `Workspace` method
 * now does.
 */
function addInactiveLeaves(app: App, count: number): WorkspaceLeaf[] {
  const group = WorkspaceTabs.create2__(app.workspace);
  app.workspace.rootSplit.insertChild(-1, group);
  const leaves: WorkspaceLeaf[] = [];
  for (let index = 0; index < count; index++) {
    const leaf = WorkspaceLeaf.create2__(app);
    group.insertChild(-1, leaf);
    leaves.push(leaf);
  }
  return leaves;
}

function collectAllLeaves(app: App): WorkspaceLeaf[] {
  const leaves: WorkspaceLeaf[] = [];
  app.workspace.iterateAllLeaves((leaf) => {
    leaves.push(leaf);
  });
  return leaves;
}

function collectRootLeaves(app: App): WorkspaceLeaf[] {
  const leaves: WorkspaceLeaf[] = [];
  app.workspace.iterateRootLeaves((leaf) => {
    leaves.push(leaf);
  });
  return leaves;
}

/**
 * Opens a tab and fills it with a Markdown view over a file of its own, because `getLeaf('tab')` hands back a tab
 * that is still showing the empty view instead of creating another one - so a test that wants a SECOND tab has to put
 * something in the first. A file view with no file closes straight back to the empty view, which is why the file is
 * real.
 */
async function openFilledTab(app: App): Promise<WorkspaceLeaf> {
  const leaf = app.workspace.getLeaf(true);
  await leaf.openFile(app.vault.createSync__(`filled-tab-${String(filledTabCounter.next++)}.md`, ''));
  return leaf;
}

describe('Workspace', () => {
  describe('asOriginalType2__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const original: WorkspaceOriginal = app.workspace.asOriginalType2__();
      expect(original).toBe(app.workspace);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const mock = Workspace.fromOriginalType2__(app.workspace.asOriginalType2__());
      expect(mock).toBe(app.workspace);
    });
  });

  describe('handleLinkContextMenu()', () => {
    it('should return false', () => {
      const app = App.createConfigured__();
      const menu = strictProxy<MenuOriginal>({});
      expect(app.workspace.handleLinkContextMenu(menu, 'linktext', 'source.md')).toBe(false);
    });
  });

  describe('changeLayout()', () => {
    it('should resolve without throwing', async () => {
      const app = App.createConfigured__();
      await expect(app.workspace.changeLayout({})).resolves.toBeUndefined();
    });
  });

  describe('createLeafBySplit()', () => {
    it('should create a new leaf', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf);
      expect(newLeaf).toBeInstanceOf(WorkspaceLeaf);
      expect(newLeaf).not.toBe(existingLeaf);
    });

    it('should make the new leaf active', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf);
      expect(app.workspace.activeLeaf).toBe(newLeaf);
    });

    it('should halve the split share between the two when the direction already runs that way', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const group = castTo<WorkspaceTabs>(existingLeaf.parent);
      group.setDimension(HALF_DIMENSION);

      const newLeaf = app.workspace.createLeafBySplit(existingLeaf, 'vertical');

      expect(group.dimension).toBe(QUARTER_DIMENSION);
      expect(castTo<WorkspaceTabs>(newLeaf.parent).dimension).toBe(QUARTER_DIMENSION);
    });

    it('should carry the split share onto the nested split of the other direction', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const group = castTo<WorkspaceTabs>(existingLeaf.parent);
      group.setDimension(HALF_DIMENSION);

      app.workspace.createLeafBySplit(existingLeaf, 'horizontal');

      const split = castTo<WorkspaceSplit>(app.workspace.rootSplit.children.at(0));
      expect(split.dimension).toBe(HALF_DIMENSION);
      expect(group.dimension).toBeNull();
    });

    it('should put the new leaf in its own tab group after the leaf\'s when the split runs in that direction', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf, 'vertical');
      expect(newLeaf.parent).toBeInstanceOf(WorkspaceTabs);
      expect(app.workspace.rootSplit.children).toEqual([existingLeaf.parent, newLeaf.parent]);
    });

    it('should put the new tab group before the leaf\'s when asked', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf, 'vertical', true);
      expect(app.workspace.rootSplit.children).toEqual([newLeaf.parent, existingLeaf.parent]);
    });

    it('should nest a split of the other direction in place of the leaf\'s tab group', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const existingTabs = existingLeaf.parent;
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf, 'horizontal');
      const split = castTo<WorkspaceSplit>(app.workspace.rootSplit.children.at(0));
      expect(split).toBeInstanceOf(WorkspaceSplit);
      expect(split.direction).toBe('horizontal');
      expect(split.children).toEqual([existingTabs, newLeaf.parent]);
    });

    it('should nest the new tab group first when asked to place it before', () => {
      const app = App.createConfigured__();
      const existingLeaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.createLeafBySplit(existingLeaf, 'horizontal', true);
      const split = castTo<WorkspaceSplit>(app.workspace.rootSplit.children.at(0));
      expect(split.children).toEqual([newLeaf.parent, existingLeaf.parent]);
    });

    it('should add the new leaf to the root tab group when the leaf is outside the layout', () => {
      const app = App.createConfigured__();
      const newLeaf = app.workspace.createLeafBySplit(WorkspaceLeaf.create2__(app));
      expect(collectRootLeaves(app)).toEqual([newLeaf]);
    });
  });

  describe('createLeafInParent()', () => {
    it('should create a new leaf', () => {
      const app = App.createConfigured__();
      const newLeaf = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);
      expect(newLeaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should make the new leaf active', () => {
      const app = App.createConfigured__();
      const newLeaf = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);
      expect(app.workspace.activeLeaf).toBe(newLeaf);
    });

    it('should give the leaf an equal share of a parent that already holds children', () => {
      const app = App.createConfigured__();
      const root = app.workspace.rootSplit.asOriginalType2__();
      const first = app.workspace.createLeafInParent(root, 0);
      const second = app.workspace.createLeafInParent(root, 1);
      const third = app.workspace.createLeafInParent(root, EXPECTED_LEAF_COUNT);
      const fourth = app.workspace.createLeafInParent(root, THREE_LEAVES);

      // An empty parent sets no share at all, and the full 100 a one-child parent computes is out of the open range,
      // so `setDimension` stores it as null - both exactly as in Obsidian.
      expect(first.dimension).toBeNull();
      expect(second.dimension).toBeNull();
      expect(third.dimension).toBe(HALF_DIMENSION);
      expect(fourth.dimension).toBe(THIRD_DIMENSION);
    });

    it('should insert the leaf into the parent at the index', () => {
      const app = App.createConfigured__();
      const second = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);
      const first = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);
      expect(app.workspace.rootSplit.children).toEqual([first, second]);
    });
  });

  describe('createLeafInTabGroup()', () => {
    it('should make the new leaf active when focusNewTab is on, which is the default', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.createLeafInTabGroup();
      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should leave the new leaf inactive when focusNewTab is off', async () => {
      const app = App.createConfigured__();
      const active = await openFilledTab(app);
      app.vault.setConfig('focusNewTab', false);

      const leaf = app.workspace.createLeafInTabGroup();

      expect(leaf).not.toBe(active);
      expect(app.workspace.activeLeaf).toBe(active);
    });

    it('should create the leaf in the given group', () => {
      const app = App.createConfigured__();
      const group = WorkspaceTabs.create2__(app.workspace);
      app.workspace.rootSplit.insertChild(-1, group);

      const leaf = app.workspace.createLeafInTabGroup(group.asOriginalType3__());

      expect(group.children).toEqual([leaf]);
    });

    it('should fall back to the root tab group when no leaf was ever active', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.createLeafInTabGroup();
      expect(leaf.parent).toBeInstanceOf(WorkspaceTabs);
      expect(app.workspace.rootSplit.children).toEqual([leaf.parent]);
    });

    it('should reuse the root tab group the root split already holds', () => {
      const app = App.createConfigured__();
      const group = WorkspaceTabs.create2__(app.workspace);
      app.workspace.rootSplit.insertChild(-1, group);

      const leaf = app.workspace.createLeafInTabGroup();

      expect(leaf.parent).toBe(group);
    });

    it('should hand back the most recently active tab when it is still showing the empty view', () => {
      const app = App.createConfigured__();
      const first = app.workspace.createLeafInTabGroup();
      expect(app.workspace.createLeafInTabGroup()).toBe(first);
    });

    it('should not activate the tab it hands back', async () => {
      const app = App.createConfigured__();
      const active = await openFilledTab(app);
      const untouched = ensureNonNullable(addInactiveLeaves(app, 1).at(0));

      const leaf = app.workspace.createLeafInTabGroup(castTo<WorkspaceTabs>(untouched.parent).asOriginalType3__());

      expect(leaf).toBe(untouched);
      expect(app.workspace.activeLeaf).toBe(active);
    });

    it('should create a tab when the most recently active one holds a file', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const first = app.workspace.createLeafInTabGroup();
      await first.openFile(ensureNonNullable(app.vault.getFileByPath('note.md')));

      expect(app.workspace.createLeafInTabGroup()).not.toBe(first);
    });

    it('should create a tab when the most recently active one has a view state naming a registered type', async () => {
      const app = App.createConfigured__();
      app.viewRegistry.registerView('DummyView', (leaf) => new DummyView(WorkspaceLeaf.fromOriginalType3__(leaf)).asOriginalType2__());
      const first = app.workspace.createLeafInTabGroup();
      await first.setViewState({ type: 'DummyView' });

      expect(app.workspace.createLeafInTabGroup()).not.toBe(first);
    });

    it('should hand back a tab showing the unknown view, which Obsidian counts as empty', async () => {
      const app = App.createConfigured__();
      const first = app.workspace.createLeafInTabGroup();
      await first.setViewState({ type: 'unregistered-type' });

      expect(app.workspace.createLeafInTabGroup()).toBe(first);
    });

    it('should create a tab when the most recently active one has a view open', async () => {
      const app = App.createConfigured__();
      const first = app.workspace.createLeafInTabGroup();
      await first.open(new DummyView(first).asOriginalType2__());

      expect(app.workspace.createLeafInTabGroup()).not.toBe(first);
    });
  });

  describe('detachLeavesOfType()', () => {
    it('should detach leaves matching the given view type', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ state: { file: 'note.md' }, type: 'markdown' });
      app.workspace.detachLeavesOfType('markdown');
      expect(app.workspace.getLeavesOfType('markdown').length).toBe(0);
    });

    it('should not detach leaves of other types', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf1 = app.workspace.getLeaf(true);
      await leaf1.setViewState({ state: { file: 'note.md' }, type: 'markdown' });
      const leaf2 = app.workspace.getLeaf(true);
      await leaf2.setViewState({ type: 'canvas' });
      app.workspace.detachLeavesOfType('markdown');
      expect(app.workspace.getLeavesOfType('canvas').length).toBe(1);
    });
  });

  describe('duplicateLeaf()', () => {
    it('should create a new leaf for a pane type', async () => {
      const app = App.createConfigured__();
      const leaf = await openFilledTab(app);
      const dup = await app.workspace.duplicateLeaf(leaf, 'tab');
      expect(dup).toBeInstanceOf(WorkspaceLeaf);
      expect(dup).not.toBe(leaf);
    });

    it('should duplicate into the leaf itself when no pane type is given, as Obsidian does', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      // With no pane type Obsidian asks `getLeaf(undefined)`, which is `getUnpinnedLeaf()` - and that hands back the
      // active leaf whenever it can navigate.
      const dup = await app.workspace.duplicateLeaf(leaf);
      expect(dup).toBe(leaf);
    });

    it('should copy the view state and the ephemeral state', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ state: { file: 'note.md' }, type: 'markdown' }, { line: EPHEMERAL_LINE });
      const dup = await app.workspace.duplicateLeaf(leaf, 'tab');
      expect(dup.getViewState()).toEqual({ state: { file: 'note.md' }, type: 'markdown' });
      expect(dup.getEphemeralState()).toEqual({ focus: true, line: EPHEMERAL_LINE });
    });

    it('should split the leaf for a split direction given as the leaf type', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const dup = await app.workspace.duplicateLeaf(leaf, 'horizontal');
      const split = castTo<WorkspaceSplit>(app.workspace.rootSplit.children.at(0));
      expect(split.direction).toBe('horizontal');
      expect(split.children).toEqual([leaf.parent, dup.parent]);
    });

    it('should split the leaf in the given direction for \'split\'', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const dup = await app.workspace.duplicateLeaf(leaf, 'split', 'vertical');
      expect(app.workspace.rootSplit.children).toEqual([leaf.parent, dup.parent]);
    });
  });

  describe('ensureSideLeaf()', () => {
    it('should create a new leaf', async () => {
      const app = App.createConfigured__();
      const leaf = await app.workspace.ensureSideLeaf('test', 'left');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should create the leaf in the requested sidebar with the view type set', async () => {
      const app = App.createConfigured__();
      const left = await app.workspace.ensureSideLeaf('left-view', 'left');
      const right = await app.workspace.ensureSideLeaf('right-view', 'right');
      expect(left.getRoot()).toBe(app.workspace.leftSplit);
      expect(right.getRoot()).toBe(app.workspace.rightSplit);
      expect(left.getViewState()).toEqual({ state: {}, type: 'left-view' });
    });

    it('should reuse an existing leaf of the type without resetting its view state', async () => {
      const app = App.createConfigured__();
      const first = await app.workspace.ensureSideLeaf('test', 'left');
      const setViewStateSpy = vi.spyOn(first, 'setViewState');
      const second = await app.workspace.ensureSideLeaf('test', 'right');
      expect(second).toBe(first);
      expect(setViewStateSpy).not.toHaveBeenCalled();
    });

    it('should set the given state even on an existing leaf', async () => {
      const app = App.createConfigured__();
      const first = await app.workspace.ensureSideLeaf('test', 'left');
      await app.workspace.ensureSideLeaf('test', 'left', { state: { query: 'x' } });
      expect(first.getViewState()).toEqual({ state: { query: 'x' }, type: 'test' });
    });

    it('should put the leaf in a new tab group when split is set', async () => {
      const app = App.createConfigured__();
      await app.workspace.ensureSideLeaf('first', 'left');
      await app.workspace.ensureSideLeaf('second', 'left', { split: true });
      expect(app.workspace.leftSplit.children).toHaveLength(EXPECTED_LEAF_COUNT);
    });

    it('should expand a collapsed sidebar unless reveal is false', async () => {
      const app = App.createConfigured__();
      app.workspace.leftSplit.collapse();
      await app.workspace.ensureSideLeaf('hidden', 'left', { reveal: false });
      expect(app.workspace.leftSplit.collapsed).toBe(true);
      await app.workspace.ensureSideLeaf('shown', 'left');
      expect(app.workspace.leftSplit.collapsed).toBe(false);
    });

    it('should make the leaf active only when active is set', async () => {
      const app = App.createConfigured__();
      await app.workspace.ensureSideLeaf('passive', 'left');
      expect(app.workspace.activeLeaf).toBeNull();
      const leaf = await app.workspace.ensureSideLeaf('active', 'left', { active: true, reveal: false });
      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should not load the leaf when neither revealing nor activating it', async () => {
      const app = App.createConfigured__();
      const loadSpy = vi.spyOn(WorkspaceLeaf.prototype, 'loadIfDeferred');
      await app.workspace.ensureSideLeaf('quiet', 'left', { reveal: false });
      expect(loadSpy).not.toHaveBeenCalled();
      loadSpy.mockRestore();
    });
  });

  describe('getActiveFile()', () => {
    it('should return null when no active leaf', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getActiveFile()).toBeNull();
    });

    it('should return the file from the active leaf', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
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
    it('should return null when there is no active leaf', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getActiveViewOfType(castTo<ConstructorOriginal<ViewOriginal>>(DummyView))).toBeNull();
    });

    it('should return the active leaf\'s view when it is an instance of the type', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(false);
      const view = new DummyView(leaf);
      await leaf.open(view.asOriginalType2__());
      expect(app.workspace.getActiveViewOfType(castTo<ConstructorOriginal<ViewOriginal>>(DummyView))).toBe(view);
    });

    it('should return null when the active leaf\'s view is of another type', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(false);
      await leaf.open(new OtherView(leaf).asOriginalType2__());
      expect(app.workspace.getActiveViewOfType(castTo<ConstructorOriginal<ViewOriginal>>(DummyView))).toBeNull();
    });
  });

  describe('getGroupLeaves()', () => {
    it('should return leaves in the given group', () => {
      const app = App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      leaf1.setGroup('my-group');
      leaf2.setGroup('my-group');
      const result = app.workspace.getGroupLeaves('my-group');
      expect(result).toContain(leaf1);
      expect(result).toContain(leaf2);
    });

    it('should return no leaves for an empty group id', () => {
      const app = App.createConfigured__();
      app.workspace.getLeaf(true);
      expect(app.workspace.getGroupLeaves('')).toEqual([]);
    });

    it('should not return leaves from other groups', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setGroup('other');
      const result = app.workspace.getGroupLeaves('my-group');
      expect(result).not.toContain(leaf);
    });
  });

  describe('getLastOpenFiles()', () => {
    it('should return an empty array', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getLastOpenFiles()).toEqual([]);
    });
  });

  describe('getLayout()', () => {
    it('should return an empty object', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getLayout()).toEqual({});
    });
  });

  describe('getLeaf()', () => {
    it('should return a new leaf when newLeaf is true', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "tab"', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf('tab');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "split"', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf('split');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return a new leaf when newLeaf is "window"', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf('window');
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should return active leaf when it exists and newLeaf is false', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      const result = app.workspace.getLeaf(false);
      expect(result).toBe(leaf);
    });

    it('should create and set active leaf when none exists and newLeaf is false', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
      expect(app.workspace.activeLeaf).toBe(leaf);
      expect(leaf.getRoot()).toBe(app.workspace.rootSplit);
    });

    it('should hand back the active leaf for false, when it can navigate', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(app.workspace.getLeaf(false)).toBe(leaf);
    });

    it('should not reuse a pinned active leaf for false', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setPinned(true);
      const reused = app.workspace.getLeaf(false);
      expect(reused).not.toBe(leaf);
      expect(reused.parent).toBe(leaf.parent);
    });

    it('should add a tab right after the most recently active leaf in its tab group', async () => {
      const app = App.createConfigured__();
      const first = await openFilledTab(app);
      const second = await openFilledTab(app);
      app.workspace.setActiveLeaf(second);
      app.workspace.setActiveLeaf(first);
      const third = app.workspace.getLeaf('tab');
      expect(castTo<WorkspaceTabs>(first.parent).children).toEqual([first, third, second]);
    });

    it('should add a tab to the most recent leaf\'s parent even when that holds other items', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);
      app.workspace.rootSplit.insertChild(-1, WorkspaceTabs.create2__(app.workspace));
      app.workspace.setActiveLeaf(leaf);
      const tab = app.workspace.getLeaf('tab');
      expect(app.workspace.rootSplit.children.at(EXPECTED_LEAF_COUNT)).toBe(tab);
    });

    it('should split the most recent leaf in the given direction for "split"', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const splitLeaf = app.workspace.getLeaf('split', 'horizontal');
      const split = castTo<WorkspaceSplit>(app.workspace.rootSplit.children.at(0));
      expect(split.children).toEqual([leaf.parent, splitLeaf.parent]);
    });

    it('should open a popout window for "window"', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf('window');
      expect(leaf.getContainer()).toBeInstanceOf(WorkspaceWindow);
      expect(leaf.getRoot()).toBe(app.workspace.floatingSplit);
    });
  });

  describe('getLeafById()', () => {
    it('should return the leaf with the given id', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const result = app.workspace.getLeafById(leaf.id__);
      expect(result).toBe(leaf);
    });

    it('should return the first match when several leaves share an id', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const twin = WorkspaceLeaf.create2__(app, leaf.id__);
      castTo<WorkspaceTabs>(leaf.parent).insertChild(-1, twin);
      expect(app.workspace.getLeafById(leaf.id__)).toBe(leaf);
    });

    it('should skip layout items that are neither leaves nor parents', () => {
      const app = App.createConfigured__();
      app.workspace.rootSplit.insertChild(0, new BareWorkspaceItem());
      const leaf = app.workspace.getLeaf(true);
      expect(app.workspace.getLeafById(leaf.id__)).toBe(leaf);
      expect(collectAllLeaves(app)).toEqual([leaf]);
    });

    it('should keep looking past leaves that do not match', async () => {
      const app = App.createConfigured__();
      const first = await openFilledTab(app);
      const second = app.workspace.getLeaf('tab');
      expect(first).not.toBe(second);
      expect(app.workspace.getLeafById(second.id__)).toBe(second);
    });

    it('should return null for unknown id', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getLeafById('nonexistent')).toBeNull();
    });
  });

  describe('getLeavesOfType()', () => {
    it('should return leaves matching the view type', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ state: { file: 'note.md' }, type: 'markdown' });
      const result = app.workspace.getLeavesOfType('markdown');
      expect(result).toContain(leaf);
    });

    it('should not return leaves of different types', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ type: 'canvas' });
      const result = app.workspace.getLeavesOfType('markdown');
      expect(result).not.toContain(leaf);
    });

    it('should find sidebar leaves too', async () => {
      const app = App.createConfigured__();
      const leaf = await app.workspace.ensureSideLeaf('outline', 'right');
      expect(app.workspace.getLeavesOfType('outline')).toEqual([leaf]);
    });

    it('should prefer the open view\'s type over the stored view state, as Obsidian does', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      await leaf.setViewState({ type: 'markdown' });
      await leaf.open(new DummyView(leaf).asOriginalType2__());

      expect(app.workspace.getLeavesOfType('markdown')).toEqual([]);
      expect(app.workspace.getLeavesOfType('DummyView')).toEqual([leaf]);
    });

    it('should report a leaf that has neither as showing the empty view', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(app.workspace.getLeavesOfType('empty')).toEqual([leaf]);
    });
  });

  describe('getLeftLeaf()', () => {
    it('should create a new leaf', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeftLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should add leaves to the first tab group of the left sidebar', () => {
      const app = App.createConfigured__();
      const first = app.workspace.getLeftLeaf(false);
      const second = app.workspace.getLeftLeaf(false);
      expect(app.workspace.leftSplit.children).toHaveLength(1);
      expect(castTo<WorkspaceTabs>(app.workspace.leftSplit.children.at(0)).children).toEqual([first, second]);
    });

    it('should add a new tab group when split is set', () => {
      const app = App.createConfigured__();
      app.workspace.getLeftLeaf(false);
      const leaf = app.workspace.getLeftLeaf(true);
      expect(app.workspace.leftSplit.children).toHaveLength(EXPECTED_LEAF_COUNT);
      expect(app.workspace.leftSplit.children.at(1)).toBe(leaf?.parent);
    });

    it('should return null when the sidebar\'s first child cannot hold a leaf', () => {
      const app = App.createConfigured__();
      app.workspace.createLeafInParent(app.workspace.leftSplit.asOriginalType2__(), 0);
      expect(app.workspace.getLeftLeaf(false)).toBeNull();
    });
  });

  describe('getMostRecentLeaf()', () => {
    it('should return null when no leaves', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getMostRecentLeaf()).toBeNull();
    });

    it('should return the first leaf when none was ever active', () => {
      const app = App.createConfigured__();
      const leaf1 = ensureNonNullable(addInactiveLeaves(app, EXPECTED_LEAF_COUNT).at(0));
      expect(app.workspace.getMostRecentLeaf()).toBe(leaf1);
    });

    it('should return the most recently active leaf, not the last one added', () => {
      const app = App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf2);
      app.workspace.setActiveLeaf(leaf1);
      addInactiveLeaves(app, 1);
      expect(app.workspace.getMostRecentLeaf()).toBe(leaf1);
    });

    it('should ignore sidebar leaves by default but search popout windows', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      const sideLeaf = castTo<WorkspaceLeaf>(app.workspace.getRightLeaf(false));
      app.workspace.setActiveLeaf(rootLeaf);
      app.workspace.setActiveLeaf(sideLeaf);
      expect(app.workspace.getMostRecentLeaf()).toBe(rootLeaf);
      const popoutLeaf = app.workspace.openPopoutLeaf();
      app.workspace.setActiveLeaf(popoutLeaf);
      expect(app.workspace.getMostRecentLeaf()).toBe(popoutLeaf);
    });

    it('should search only the given root', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      const sideLeaf = castTo<WorkspaceLeaf>(app.workspace.getRightLeaf(false));
      app.workspace.setActiveLeaf(rootLeaf);
      expect(app.workspace.getMostRecentLeaf(app.workspace.rightSplit.asOriginalType2__())).toBe(sideLeaf);
    });
  });

  describe('getRightLeaf()', () => {
    it('should create a new leaf in the right sidebar', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getRightLeaf(false);
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
      expect(leaf?.getRoot()).toBe(app.workspace.rightSplit);
    });
  });

  describe('getUnpinnedLeaf()', () => {
    it('should return an existing unpinned leaf', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      expect(app.workspace.getUnpinnedLeaf()).toBe(leaf);
    });

    it('should not pick a sidebar leaf', () => {
      const app = App.createConfigured__();
      const sideLeaf = app.workspace.getLeftLeaf(false);
      const leaf = app.workspace.getUnpinnedLeaf();
      expect(leaf).not.toBe(sideLeaf);
      expect(leaf.getRoot()).toBe(app.workspace.rootSplit);
    });

    it('should search the container of the active leaf', () => {
      const app = App.createConfigured__();
      app.workspace.getLeaf(true);
      const popoutLeaf = app.workspace.openPopoutLeaf();
      app.workspace.setActiveLeaf(popoutLeaf);
      expect(app.workspace.getUnpinnedLeaf()).toBe(popoutLeaf);
    });

    it('should create a new leaf when all are pinned', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setPinned(true);
      const unpinned = app.workspace.getUnpinnedLeaf();
      expect(unpinned).not.toBe(leaf);
      expect(unpinned).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should pick the most recently active leaf that is its group\'s current tab', async () => {
      const app = App.createConfigured__();
      const first = await openFilledTab(app);
      const second = app.workspace.getLeaf('tab');
      const outsider = app.workspace.createLeafBySplit(second);
      outsider.setPinned(true);

      expect(first).not.toBe(second);
      expect(app.workspace.getUnpinnedLeaf()).toBe(second);
    });

    it('should not activate the leaf when asked not to', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const outsider = app.workspace.createLeafBySplit(leaf);
      outsider.setPinned(true);

      expect(app.workspace.getUnpinnedLeaf(false)).toBe(leaf);
      expect(app.workspace.activeLeaf).toBe(outsider);
    });

    it('should consider every leaf of a stacked group, not only its current tab', async () => {
      const app = App.createConfigured__();
      const first = await openFilledTab(app);
      const second = app.workspace.getLeaf('tab');
      const outsider = app.workspace.createLeafBySplit(second);
      outsider.setPinned(true);
      const group = castTo<WorkspaceTabs>(first.parent);
      group.setStacked(true);
      group.selectTabIndex(0);

      expect(app.workspace.getUnpinnedLeaf(false)).toBe(second);
    });
  });

  describe('getFocusedContainer()', () => {
    it('should return the root split, the mock having one window', () => {
      const app = App.createConfigured__();
      expect(app.workspace.getFocusedContainer()).toBe(app.workspace.rootSplit);
    });
  });

  describe('isAttached()', () => {
    it('should answer false for no item', () => {
      const app = App.createConfigured__();
      expect(app.workspace.isAttached()).toBe(false);
    });

    it('should answer true for a leaf in the layout and false for one outside it', () => {
      const app = App.createConfigured__();
      const attached = app.workspace.getLeaf(true);
      const loose = WorkspaceLeaf.create2__(app);
      expect(app.workspace.isAttached(attached)).toBe(true);
      expect(app.workspace.isAttached(loose)).toBe(false);
    });

    it('should answer true for a sidebar leaf and a popout leaf', () => {
      const app = App.createConfigured__();
      const side = castTo<WorkspaceLeaf>(app.workspace.getRightLeaf(false));
      const popout = app.workspace.openPopoutLeaf();
      expect(app.workspace.isAttached(side)).toBe(true);
      expect(app.workspace.isAttached(popout)).toBe(true);
    });
  });

  describe('iterateLeaves()', () => {
    it('should stop the walk on a truthy callback', () => {
      const app = App.createConfigured__();
      const first = app.workspace.getLeaf(true);
      app.workspace.getLeaf('tab');
      const visited: WorkspaceLeaf[] = [];

      const isStopped = app.workspace.iterateLeaves(app.workspace.rootSplit, (leaf) => {
        visited.push(leaf);
        return true;
      });

      expect(isStopped).toBe(true);
      expect(visited).toEqual([first]);
    });

    it('should report false when the callback never stops it', () => {
      const app = App.createConfigured__();
      app.workspace.getLeaf(true);
      expect(app.workspace.iterateLeaves(app.workspace.rootSplit, () => false)).toBe(false);
    });

    it('should accept several items', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      const sideLeaf = castTo<WorkspaceLeaf>(app.workspace.getRightLeaf(false));
      const visited: WorkspaceLeaf[] = [];

      app.workspace.iterateLeaves([app.workspace.rootSplit, app.workspace.rightSplit], (leaf) => {
        visited.push(leaf);
      });

      expect(visited).toEqual([rootLeaf, sideLeaf]);
    });
  });

  describe('iterateAllLeaves()', () => {
    it('should iterate over all leaves', async () => {
      const app = App.createConfigured__();
      await openFilledTab(app);
      app.workspace.getLeaf(true);
      expect(collectAllLeaves(app).length).toBe(EXPECTED_LEAF_COUNT);
    });

    it('should visit the root split, the left sidebar, the right sidebar, then the popout windows', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      const popoutLeaf = app.workspace.openPopoutLeaf();
      const rightLeaf = app.workspace.getRightLeaf(false);
      const leftLeaf = app.workspace.getLeftLeaf(false);
      expect(collectAllLeaves(app)).toEqual([rootLeaf, leftLeaf, rightLeaf, popoutLeaf]);
    });

    it('should let a truthy callback stop only the part it is in', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      app.workspace.getLeaf('tab');
      const leftLeaf = app.workspace.getLeftLeaf(false);
      const visited: WorkspaceLeaf[] = [];

      app.workspace.iterateAllLeaves((leaf) => {
        visited.push(leaf);
        return true;
      });

      // Obsidian starts one walk per part and discards all four answers, so the sidebar is still visited.
      expect(visited).toEqual([rootLeaf, leftLeaf]);
    });
  });

  describe('iterateRootLeaves()', () => {
    it('should iterate over the root leaves', () => {
      const app = App.createConfigured__();
      app.workspace.getLeaf(true);
      expect(collectRootLeaves(app).length).toBe(1);
    });

    it('should skip sidebar and popout window leaves', () => {
      const app = App.createConfigured__();
      const rootLeaf = app.workspace.getLeaf(true);
      app.workspace.getLeftLeaf(false);
      app.workspace.getRightLeaf(false);
      app.workspace.openPopoutLeaf();
      expect(collectRootLeaves(app)).toEqual([rootLeaf]);
    });
  });

  describe('moveLeafToPopout()', () => {
    it('should return a WorkspaceWindow', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const win = app.workspace.moveLeafToPopout(leaf);
      expect(win).toBeInstanceOf(WorkspaceWindow);
    });

    it('should add the leaf if not already tracked', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      app.workspace.moveLeafToPopout(leaf);
      expect(collectAllLeaves(app)).toContain(leaf);
    });

    it('should move the leaf out of the main area into the new window', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const win = app.workspace.moveLeafToPopout(leaf);
      expect(leaf.getContainer()).toBe(win);
      expect(app.workspace.floatingSplit.children).toEqual([win]);
      expect(collectRootLeaves(app)).toEqual([]);
    });

    it('should give up the leaf\'s share of the split it came from', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      leaf.setDimension(HALF_DIMENSION);

      app.workspace.moveLeafToPopout(leaf);

      expect(leaf.dimension).toBeNull();
    });
  });

  describe('onLayoutReady()', () => {
    it('should invoke callback immediately if layout is ready', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const callback = vi.fn();
      app.workspace.onLayoutReady(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should defer callback until layout becomes ready', () => {
      const app = App.createConfigured__();
      const callback = vi.fn();
      app.workspace.onLayoutReady(callback);
      expect(callback).not.toHaveBeenCalled();
      app.workspace.setLayoutReady__();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('openLinkText()', () => {
    it('should open a file matching the link text', async () => {
      const app = App.createConfigured__({
        files: { 'notes/hello.md': 'content' }
      });

      await app.workspace.openLinkText('hello', 'notes/other.md');

      expect(collectAllLeaves(app).length).toBeGreaterThanOrEqual(1);
    });

    it('should resolve link using metadataCache', async () => {
      const app = App.createConfigured__({
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
      const app = App.createConfigured__({
        files: { 'test.md': '' }
      });
      const leavesBefore = collectAllLeaves(app);

      await app.workspace.openLinkText('test', '', true);

      expect(collectAllLeaves(app).length).toBe(leavesBefore.length + 1);
    });

    it('should do nothing when link cannot be resolved', async () => {
      const app = App.createConfigured__();
      const leavesBefore = collectAllLeaves(app);

      await app.workspace.openLinkText('nonexistent', '');

      expect(collectAllLeaves(app).length).toBe(leavesBefore.length);
    });
  });

  describe('openPopoutLeaf()', () => {
    it('should create a new leaf', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.openPopoutLeaf();
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
    });

    it('should put the leaf in a tab group of a new window under the floating split', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.openPopoutLeaf();
      expect(leaf.parent).toBeInstanceOf(WorkspaceTabs);
      expect(leaf.getContainer()).toBeInstanceOf(WorkspaceWindow);
      expect(app.workspace.floatingSplit.children).toEqual([leaf.getContainer()]);
    });

    it('should close the window when its last leaf detaches', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.openPopoutLeaf();
      leaf.detach();
      expect(app.workspace.floatingSplit.children).toEqual([]);
    });
  });

  describe('removeLeaf__()', () => {
    it('should remove the leaf from the workspace', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.removeLeaf__(leaf);
      expect(collectAllLeaves(app)).not.toContain(leaf);
    });

    it('should accept a leaf outside the layout', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(() => {
        app.workspace.removeLeaf__(leaf);
      }).not.toThrow();
    });

    it('should leave activeLeaf pointing at the removed leaf, as Obsidian does', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      app.workspace.removeLeaf__(leaf);
      // Obsidian clears nothing here: `updateLayout` notices the active leaf is detached and picks another one.
      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should let updateLayout pick another active leaf once the layout is ready', async () => {
      const app = App.createConfigured__();
      const kept = await openFilledTab(app);
      const removed = app.workspace.getLeaf('tab');
      app.workspace.setLayoutReady__();

      app.workspace.removeLeaf__(removed);
      app.workspace.updateLayout();

      expect(app.workspace.activeLeaf).toBe(kept);
    });

    it('should not clear activeLeaf if it does not match', () => {
      const app = App.createConfigured__();
      const leaf1 = app.workspace.getLeaf(true);
      const leaf2 = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf1);
      app.workspace.removeLeaf__(leaf2);
      expect(app.workspace.activeLeaf).toBe(leaf1);
    });
  });

  describe('revealLeaf()', () => {
    it('should not make the leaf active', async () => {
      const app = App.createConfigured__();
      const active = app.workspace.getLeaf(true);
      const revealed = ensureNonNullable(addInactiveLeaves(app, 1).at(0));
      await app.workspace.revealLeaf(revealed);
      expect(app.workspace.activeLeaf).toBe(active);
    });

    it('should expand the collapsed sidebar the leaf is in', async () => {
      const app = App.createConfigured__();
      const leaf = castTo<WorkspaceLeaf>(app.workspace.getRightLeaf(false));
      app.workspace.rightSplit.collapse();
      await app.workspace.revealLeaf(leaf);
      expect(app.workspace.rightSplit.collapsed).toBe(false);
    });

    it('should load the leaf', async () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const loadSpy = vi.spyOn(leaf, 'loadIfDeferred');
      await app.workspace.revealLeaf(leaf);
      expect(loadSpy).toHaveBeenCalledOnce();
    });
  });

  describe('setActiveLeaf()', () => {
    it('should set the active leaf', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.setActiveLeaf(leaf);
      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should add the leaf if not tracked', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      app.workspace.setActiveLeaf(leaf);
      expect(collectAllLeaves(app)).toContain(leaf);
    });

    it('should move a leaf held outside the layout into the root tab group', () => {
      const app = App.createConfigured__();
      const strayTabs = WorkspaceTabs.create2__(app.workspace);
      const leaf = WorkspaceLeaf.create2__(app);
      strayTabs.insertChild(0, leaf);
      app.workspace.setActiveLeaf(leaf);
      expect(strayTabs.children).toEqual([]);
      expect(leaf.getRoot()).toBe(app.workspace.rootSplit);
    });

    it('should leave a sidebar leaf where it is', () => {
      const app = App.createConfigured__();
      const leaf = castTo<WorkspaceLeaf>(app.workspace.getLeftLeaf(false));
      app.workspace.setActiveLeaf(leaf);
      expect(leaf.getRoot()).toBe(app.workspace.leftSplit);
    });

    it('should stamp a strictly increasing activeTime', () => {
      const app = App.createConfigured__();
      const leaves = addInactiveLeaves(app, EXPECTED_LEAF_COUNT);
      const leaf1 = ensureNonNullable(leaves.at(0));
      const leaf2 = ensureNonNullable(leaves.at(1));
      expect(leaf1.activeTime).toBe(0);
      app.workspace.setActiveLeaf(leaf1);
      app.workspace.setActiveLeaf(leaf2);
      expect(leaf1.activeTime).toBeGreaterThan(0);
      expect(leaf2.activeTime).toBeGreaterThan(leaf1.activeTime);
    });

    it('should trigger active-leaf-change, deferred, once the layout is ready', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const leaf = ensureNonNullable(addInactiveLeaves(app, 1).at(0));
      const handler = vi.fn();
      app.workspace.on('active-leaf-change', handler);

      app.workspace.setActiveLeaf(leaf);
      expect(handler).not.toHaveBeenCalled();

      app.workspace.requestActiveLeafEvents.run();
      expect(handler).toHaveBeenCalledWith(leaf);
    });

    it('should not trigger active-leaf-change until the layout is ready', () => {
      const app = App.createConfigured__();
      const leaf = ensureNonNullable(addInactiveLeaves(app, 1).at(0));
      const handler = vi.fn();
      app.workspace.on('active-leaf-change', handler);

      app.workspace.setActiveLeaf(leaf);
      app.workspace.requestActiveLeafEvents.run();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should trigger file-open when the active file changed', async () => {
      const app = App.createConfigured__({ files: { 'note.md': '' } });
      app.workspace.setLayoutReady__();
      const leaf = ensureNonNullable(addInactiveLeaves(app, 1).at(0));
      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('note.md')));
      const handler = vi.fn();
      app.workspace.on('file-open', handler);

      app.workspace.setActiveLeaf(leaf);
      app.workspace.requestActiveLeafEvents.run();

      expect(handler).toHaveBeenCalledWith(app.vault.getFileByPath('note.md'));
    });

    it('should do nothing for a leaf that is already active', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.requestActiveLeafEvents.run();
      const handler = vi.fn();
      app.workspace.on('active-leaf-change', handler);

      const activeTime = leaf.activeTime;
      app.workspace.setActiveLeaf(leaf);
      app.workspace.requestActiveLeafEvents.run();

      expect(leaf.activeTime).toBe(activeTime);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should adopt a leaf outside the layout into the root tab group the root split already holds', () => {
      const app = App.createConfigured__();
      const placed = app.workspace.getLeaf(true);
      const loose = WorkspaceLeaf.create2__(app);

      app.workspace.setActiveLeaf(loose);

      expect(loose.parent).toBe(placed.parent);
      expect(app.workspace.activeLeaf).toBe(loose);
    });

    it('should show the leaf in its tab group', () => {
      const app = App.createConfigured__();
      const leaves = addInactiveLeaves(app, EXPECTED_LEAF_COUNT);
      const second = ensureNonNullable(leaves.at(1));

      app.workspace.setActiveLeaf(second);

      const group = castTo<WorkspaceTabs>(second.parent);
      expect(group.currentTab).toBe(1);
      expect(app.workspace.activeTabGroup).toBe(group);
    });
  });

  describe('setLayoutReady__()', () => {
    it('should set layoutReady to true', () => {
      const app = App.createConfigured__();
      expect(app.workspace.layoutReady).toBe(false);
      app.workspace.setLayoutReady__();
      expect(app.workspace.layoutReady).toBe(true);
    });

    it('should invoke and clear pending callbacks', () => {
      const app = App.createConfigured__();
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      app.workspace.onLayoutReady(callback1);
      app.workspace.onLayoutReady(callback2);
      app.workspace.setLayoutReady__();
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      // Calling again should not re-invoke
      callback1.mockClear();
      app.workspace.setLayoutReady__();
      expect(callback1).not.toHaveBeenCalled();
    });
  });

  describe('splitActiveLeaf()', () => {
    it('should create a new leaf at the start of the root split when there are no leaves', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.splitActiveLeaf();
      expect(leaf).toBeInstanceOf(WorkspaceLeaf);
      expect(app.workspace.rootSplit.children).toEqual([leaf]);
    });

    it('should split the most recent leaf', () => {
      const app = App.createConfigured__();
      const leaf = app.workspace.getLeaf(true);
      const newLeaf = app.workspace.splitActiveLeaf();
      expect(app.workspace.rootSplit.children).toEqual([leaf.parent, newLeaf.parent]);
    });
  });

  describe('onLayoutChange() / requestUpdateLayout() / updateLayout()', () => {
    it('should do nothing until the layout is ready', () => {
      const app = App.createConfigured__();
      app.workspace.updateLayout();
      expect(app.workspace.rootSplit.children).toEqual([]);
    });

    it('should re-populate an emptied root split, keeping the last group\'s stacking', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const leaf = app.workspace.getLeaf(true);
      castTo<WorkspaceTabs>(leaf.parent).setStacked(true);

      leaf.detach();
      await noopAsync();

      const group = castTo<WorkspaceTabs>(app.workspace.rootSplit.children.at(0));
      expect(group).toBeInstanceOf(WorkspaceTabs);
      expect(group.isStacked).toBe(true);
      expect(collectRootLeaves(app).length).toBe(1);
      expect(app.workspace.activeLeaf).toBe(group.children.at(0));
    });

    it('should populate and activate an empty ready workspace', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();

      app.workspace.updateLayout();

      const leaves = collectRootLeaves(app);
      expect(leaves.length).toBe(1);
      expect(app.workspace.activeLeaf).toBe(leaves.at(0));
    });

    it('should fall back past an active tab group that is no longer attached', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const kept = app.workspace.getLeaf(true);
      const detached = app.workspace.createLeafBySplit(kept);
      expect(app.workspace.activeTabGroup).toBe(detached.parent);

      // Detaching the group's only leaf takes the group out of the layout with it.
      detached.detach();
      app.workspace.updateLayout();

      expect(app.workspace.activeLeaf).toBe(kept);
    });

    it('should prefer the active tab group\'s current tab when re-picking', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const kept = await openFilledTab(app);
      const detached = app.workspace.getLeaf('tab');
      const other = app.workspace.createLeafBySplit(detached);
      app.workspace.setActiveLeaf(detached);

      detached.detach();
      app.workspace.updateLayout();

      expect(app.workspace.activeLeaf).toBe(kept);
      expect(app.workspace.activeLeaf).not.toBe(other);
    });

    it('should keep activeTabGroup in step when the active leaf is still attached', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const leaf = app.workspace.getLeaf(true);
      app.workspace.activeTabGroup = null;

      app.workspace.updateLayout();

      expect(app.workspace.activeTabGroup).toBe(leaf.parent);
    });

    it('should clear a link group that is down to a single leaf', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const first = await openFilledTab(app);
      const second = app.workspace.getLeaf('tab');
      first.setGroup('group-1');
      second.setGroup('group-1');

      second.detach();
      app.workspace.updateLayout();

      expect(first.getGroup__()).toBeNull();
    });

    it('should leave a link group with several leaves alone', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const first = await openFilledTab(app);
      const second = app.workspace.getLeaf('tab');
      first.setGroup('group-1');
      second.setGroup('group-1');

      app.workspace.updateLayout();

      expect(first.getGroup__()).toBe('group-1');
      expect(second.getGroup__()).toBe('group-1');
    });

    it('should trigger layout-change, debounced, once the layout is ready', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const handler = vi.fn();
      app.workspace.on('layout-change', handler);

      app.workspace.updateLayout();
      expect(handler).not.toHaveBeenCalled();

      app.workspace.requestLayoutChangeEvents.run();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not trigger layout-change before the layout is ready', () => {
      const app = App.createConfigured__();
      const handler = vi.fn();
      app.workspace.on('layout-change', handler);

      app.workspace.requestLayoutChangeEvents();
      app.workspace.requestLayoutChangeEvents.run();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should keep activeTabGroup null for an active leaf that is not in a tab group', () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const leaf = app.workspace.createLeafInParent(app.workspace.rootSplit.asOriginalType2__(), 0);

      app.workspace.updateLayout();

      expect(leaf.parent).toBe(app.workspace.rootSplit);
      expect(app.workspace.activeTabGroup).toBeNull();
    });

    it('should fall back when the active tab group holds no leaf at its current tab', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const kept = await openFilledTab(app);
      const detached = app.workspace.getLeaf('tab');
      const group = castTo<WorkspaceTabs>(detached.parent);

      detached.detach();
      // Obsidian clamps `currentTab` while it renders the tab headers, which the mock does not model - so the
      // fall-through is what answers an index nothing sits at.
      group.currentTab = OUT_OF_RANGE_INDEX;
      app.workspace.updateLayout();

      expect(app.workspace.activeLeaf).toBe(kept);
    });

    it('should coalesce every layout change before the microtask into one update', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const updateLayoutSpy = vi.spyOn(app.workspace, 'updateLayout');

      app.workspace.onLayoutChange();
      app.workspace.onLayoutChange();
      app.workspace.requestUpdateLayout();
      expect(updateLayoutSpy).not.toHaveBeenCalled();

      await noopAsync();

      expect(updateLayoutSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOptions()', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.workspace.updateOptions();
      }).not.toThrow();
    });
  });

  describe('requestSaveLayout', () => {
    it('should be a function', () => {
      const app = App.createConfigured__();
      expect(typeof app.workspace.requestSaveLayout).toBe('function');
    });

    it('should not throw when called', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.workspace.requestSaveLayout();
      }).not.toThrow();
    });
  });

  describe('containerEl', () => {
    it('should be an HTMLElement', () => {
      const app = App.createConfigured__();
      expect(app.workspace.containerEl).toBeInstanceOf(HTMLElement);
    });
  });

  describe('floatingSplit', () => {
    it('should be a floating item with no windows', () => {
      const app = App.createConfigured__();
      expect(app.workspace.floatingSplit).toBeInstanceOf(WorkspaceFloating);
      expect(app.workspace.floatingSplit.children).toEqual([]);
    });
  });

  describe('rootSplit', () => {
    it('should be defined', () => {
      const app = App.createConfigured__();
      expect(app.workspace.rootSplit).toBeDefined();
    });
  });

  describe('leftSplit', () => {
    it('should be defined', () => {
      const app = App.createConfigured__();
      expect(app.workspace.leftSplit).toBeDefined();
    });
  });

  describe('rightSplit', () => {
    it('should be defined', () => {
      const app = App.createConfigured__();
      expect(app.workspace.rightSplit).toBeDefined();
    });
  });
});

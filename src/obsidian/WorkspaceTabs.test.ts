import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceTabs } from './WorkspaceTabs.ts';

const THREE_TABS = 3;
const OUT_OF_RANGE_INDEX = 10;

interface BuiltGroup {
  app: App;
  group: WorkspaceTabs;
  leaves: WorkspaceLeaf[];
}

function buildGroup(count: number): BuiltGroup {
  const app = App.createConfigured__();
  const group = WorkspaceTabs.create2__(app.workspace);
  app.workspace.rootSplit.insertChild(-1, group);
  const leaves: WorkspaceLeaf[] = [];
  for (let index = 0; index < count; index++) {
    const leaf = WorkspaceLeaf.create2__(app);
    group.insertChild(-1, leaf);
    leaves.push(leaf);
  }
  return { app, group, leaves };
}

describe('WorkspaceTabs', () => {
  it('should create an instance via create2__', () => {
    const app = App.createConfigured__();
    const tabs = WorkspaceTabs.create2__(app.workspace);
    expect(tabs).toBeInstanceOf(WorkspaceTabs);
  });

  describe('asOriginalType4__()', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const original: WorkspaceTabsOriginal = tabs.asOriginalType4__();
      expect(original).toBe(tabs);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const tabs = WorkspaceTabs.create2__(app.workspace);
      const mock = WorkspaceTabs.fromOriginalType4__(tabs.asOriginalType4__());
      expect(mock).toBe(tabs);
    });
  });

  describe('selectTabIndex()', () => {
    it('should move the current tab', () => {
      const { group } = buildGroup(THREE_TABS);
      group.selectTabIndex(1);
      expect(group.currentTab).toBe(1);
    });

    it('should clamp the index to the group\'s range', () => {
      const { group } = buildGroup(THREE_TABS);
      group.selectTabIndex(OUT_OF_RANGE_INDEX);
      expect(group.currentTab).toBe(THREE_TABS - 1);
      group.selectTabIndex(-OUT_OF_RANGE_INDEX);
      expect(group.currentTab).toBe(0);
    });

    it('should do nothing for the tab that is already current', () => {
      const { app, group } = buildGroup(THREE_TABS);
      const requestSaveLayoutSpy = vi.spyOn(app.workspace.requestSaveLayout, 'cancel');
      group.selectTabIndex(0);
      expect(group.currentTab).toBe(0);
      expect(requestSaveLayoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectTab()', () => {
    it('should show the given child', () => {
      const { group, leaves } = buildGroup(THREE_TABS);
      group.selectTab(ensureNonNullable(leaves.at(1)));
      expect(group.currentTab).toBe(1);
    });

    it('should ignore an item the group does not hold', () => {
      const { app, group } = buildGroup(THREE_TABS);
      group.selectTab(WorkspaceLeaf.create2__(app));
      expect(group.currentTab).toBe(0);
    });
  });

  describe('setStacked()', () => {
    it('should stack and unstack the group', () => {
      const { group } = buildGroup(THREE_TABS);
      expect(group.isStacked).toBe(false);
      group.setStacked(true);
      expect(group.isStacked).toBe(true);
      group.setStacked(false);
      expect(group.isStacked).toBe(false);
    });

    it('should ask the workspace to update the layout when the group holds children', () => {
      const { app, group } = buildGroup(THREE_TABS);
      const requestUpdateLayoutSpy = vi.spyOn(app.workspace, 'requestUpdateLayout');
      group.setStacked(true);
      expect(requestUpdateLayoutSpy).toHaveBeenCalled();
    });

    it('should not ask for anything for an empty group, or for the stacking it already has', () => {
      const app = App.createConfigured__();
      const empty = WorkspaceTabs.create2__(app.workspace);
      const requestUpdateLayoutSpy = vi.spyOn(app.workspace, 'requestUpdateLayout');

      empty.setStacked(true);
      empty.setStacked(true);

      expect(requestUpdateLayoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('removeChild()', () => {
    it('should keep the current tab on the same leaf when an earlier one goes', () => {
      const { group, leaves } = buildGroup(THREE_TABS);
      group.selectTabIndex(THREE_TABS - 1);

      group.removeChild(ensureNonNullable(leaves.at(0)));

      expect(group.currentTab).toBe(THREE_TABS - 2);
      expect(group.children.at(group.currentTab)).toBe(leaves.at(THREE_TABS - 1));
    });

    it('should move the current tab to the nearest remaining one when the current goes', () => {
      const { group, leaves } = buildGroup(THREE_TABS);
      group.selectTabIndex(THREE_TABS - 1);

      group.removeChild(ensureNonNullable(leaves.at(THREE_TABS - 1)));

      expect(group.currentTab).toBe(THREE_TABS - 2);
    });

    it('should answer -1 when the current tab was already out of range', () => {
      const { group, leaves } = buildGroup(THREE_TABS);
      // Obsidian clamps `currentTab` while it renders the tab headers, which the mock does not model.
      group.currentTab = OUT_OF_RANGE_INDEX;

      group.removeChild(ensureNonNullable(leaves.at(0)));

      expect(group.currentTab).toBe(-1);
    });

    it('should record the stacking of a group that loses its last child', () => {
      const { app, group, leaves } = buildGroup(1);
      group.setStacked(true);

      group.removeChild(ensureNonNullable(leaves.at(0)));

      expect(app.workspace.lastTabGroupStacked).toBe(true);
      expect(group.currentTab).toBe(-1);
    });
  });
});

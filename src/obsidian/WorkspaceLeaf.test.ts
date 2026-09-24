import type {
  IconName as IconNameOriginal,
  ViewStateResult as ViewStateResultOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { EmptyView } from '../internal/empty-view.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { UnknownView } from '../internal/unknown-view.ts';
import { App } from './App.ts';
import { ItemView } from './ItemView.ts';
import { MarkdownView } from './MarkdownView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

const EXPECTED_SAVE_COUNT = 2;

/**
 * A view type nothing registers a creator for, so the leaf answers it with the unknown view.
 */
const UNREGISTERED_VIEW_TYPE = 'canvas';

class CanvasView extends ItemView {
  public override navigation = false;

  public getDisplayText(): string {
    return 'Canvas';
  }

  public override getIcon(): IconNameOriginal {
    return 'star';
  }

  public getViewType(): string {
    return UNREGISTERED_VIEW_TYPE;
  }
}

class ReEntrantView extends ItemView {
  public getDisplayText(): string {
    return 'Re-entrant';
  }

  public getViewType(): string {
    return 're-entrant';
  }

  public override async setState(_state: unknown, _result: ViewStateResultOriginal): Promise<void> {
    await this.leaf.setViewState({ type: 'empty' });
  }
}

class ThrowingStateView extends ItemView {
  public getDisplayText(): string {
    return 'Throwing';
  }

  public getViewType(): string {
    return 'throwing';
  }

  public override async setState(_state: unknown, _result: ViewStateResultOriginal): Promise<void> {
    await noopAsync();
    throw new Error('State failed');
  }
}

// Held on an object so each filled tab gets a file of its own without assigning to a module-level binding.
const filledTabCounter = { next: 1 };

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

    it('should hand activeLeaf to another leaf once the layout updates', async () => {
      const app = App.createConfigured__();
      app.workspace.setLayoutReady__();
      const kept = await openFilledTab(app);
      const leaf = app.workspace.getLeaf('tab');
      expect(app.workspace.activeLeaf).toBe(leaf);

      leaf.detach();
      // Obsidian re-picks in `updateLayout`, which its layout change asks for on a microtask.
      await noopAsync();

      expect(app.workspace.activeLeaf).toBe(kept);
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
    it('should answer the empty view\'s label for a leaf nothing has been done to', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app).getDisplayText()).toBe('New tab');
    });

    it('should answer the open view\'s display text', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.open(new CanvasView(leaf).asOriginalType2__());
      expect(leaf.getDisplayText()).toBe('Canvas');
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
    it('should answer the empty view\'s icon for a leaf nothing has been done to', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app).getIcon()).toBe('lucide-file');
    });

    it('should answer the open view\'s icon', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.open(new CanvasView(leaf).asOriginalType2__());
      expect(leaf.getIcon()).toBe('star');
    });
  });

  describe('getViewState() / setViewState()', () => {
    it('should describe the empty view a leaf is born holding', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app).getViewState()).toEqual({ state: {}, type: 'empty' });
    });

    it('should report a pinned leaf as pinned', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setPinned(true);
      expect(leaf.getViewState()).toEqual({ pinned: true, state: {}, type: 'empty' });
    });

    it('should build the view a registered type names', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ state: { file: 'note.md' }, type: 'markdown' });
      expect(leaf.view).toBeInstanceOf(MarkdownView);
      expect(leaf.getViewState()).toEqual({ state: { file: 'note.md' }, type: 'markdown' });
    });

    it('should give an unregistered type the unknown view, which keeps that type', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE });
      expect(leaf.view).toBeInstanceOf(UnknownView);
      expect(leaf.getViewState().type).toBe(UNREGISTERED_VIEW_TYPE);
      expect(leaf.getDisplayText()).toBe(UNREGISTERED_VIEW_TYPE);
      expect(leaf.getIcon()).toBe('lucide-ghost');
    });

    it('should keep the empty view for the empty type', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE });
      await leaf.setViewState({ type: 'empty' });
      expect(leaf.view).toBe(leaf._empty);
    });

    it('should not rebuild the view when the type is unchanged', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE });
      const view = leaf.view;

      await leaf.setViewState({ state: { scroll: 1 }, type: UNREGISTERED_VIEW_TYPE });

      expect(leaf.view).toBe(view);
      expect(leaf.getViewState().state).toEqual({ scroll: 1 });
    });

    it('should fall back to the unknown view when the creator throws', async () => {
      const app = App.createConfigured__();
      app.viewRegistry.registerView('broken', () => {
        throw new Error('Creator failed');
      });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.setViewState({ type: 'broken' });

      expect(leaf.view).toBeInstanceOf(UnknownView);
      expect(leaf.getViewState().type).toBe('broken');
      expect(errorSpy).toHaveBeenCalledWith('Failed to create view of type "broken"', expect.any(Error));
      errorSpy.mockRestore();
    });

    it('should send the leaf back to the empty view when a file view is left with no file', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: 'markdown' });
      expect(leaf.view).toBe(leaf._empty);
    });

    it('should log a view whose setState throws and carry on', async () => {
      const app = App.createConfigured__();
      app.viewRegistry.registerView('throwing', (leaf) => new ThrowingStateView(WorkspaceLeaf.fromOriginalType3__(leaf)).asOriginalType2__());
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.setViewState({ type: 'throwing' });

      expect(leaf.view).toBeInstanceOf(ThrowingStateView);
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
      errorSpy.mockRestore();
    });

    it('should set ephemeral state when provided', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE }, { scroll: 0 });
      expect(leaf.getEphemeralState()).toEqual({ scroll: 0 });
    });

    it('should activate the leaf when the state says so', async () => {
      const app = App.createConfigured__();
      const leaf = await openFilledTab(app);
      const other = app.workspace.getLeaf('tab');
      expect(app.workspace.activeLeaf).toBe(other);

      await leaf.setViewState({ active: true, type: UNREGISTERED_VIEW_TYPE });

      expect(app.workspace.activeLeaf).toBe(leaf);
    });

    it('should join the given leaf\'s link group', async () => {
      const app = App.createConfigured__();
      const other = WorkspaceLeaf.create2__(app);
      other.setGroup('shared');
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.setViewState({ group: other.asOriginalType3__(), type: UNREGISTERED_VIEW_TYPE });

      expect(leaf.getGroup__()).toBe('shared');
    });

    it('should ask the workspace to update the layout when the view is rebuilt', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const layoutSpy = vi.spyOn(app.workspace, 'onLayoutChange');

      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE });

      expect(layoutSpy).toHaveBeenCalled();
    });

    it('should drop a call reached from inside another one', async () => {
      const app = App.createConfigured__();
      app.viewRegistry.registerView('re-entrant', (leaf) => new ReEntrantView(WorkspaceLeaf.fromOriginalType3__(leaf)).asOriginalType2__());
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.setViewState({ type: 're-entrant' });

      expect(leaf.getViewState().type).toBe('re-entrant');
    });

    it('should return a fresh object each time', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.setViewState({ type: UNREGISTERED_VIEW_TYPE });
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

    it('should pin and unpin the other leaves in its group', async () => {
      const app = App.createConfigured__();
      const leaf1 = await openFilledTab(app);
      const leaf2 = await openFilledTab(app);
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
    it('should forward the call to the open view', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new CanvasView(leaf);
      await leaf.open(view.asOriginalType2__());
      const onResize = vi.spyOn(view, 'onResize');

      leaf.onResize();

      expect(onResize).toHaveBeenCalled();
    });
  });

  describe('canNavigate()', () => {
    it('should answer true for a leaf showing the empty view, which navigates', () => {
      const app = App.createConfigured__();
      expect(WorkspaceLeaf.create2__(app).canNavigate()).toBe(true);
    });

    it('should answer false for a pinned leaf', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      leaf.setPinned(true);
      expect(leaf.canNavigate()).toBe(false);
    });

    it('should read the open view\'s navigation flag', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.open(new CanvasView(leaf).asOriginalType2__());
      expect(leaf.canNavigate()).toBe(false);
    });
  });

  describe('_empty', () => {
    it('should be the view a leaf is born holding', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf._empty).toBeInstanceOf(EmptyView);
      expect(leaf.view).toBe(leaf._empty);
      expect(leaf.containerEl.contains(leaf._empty.containerEl)).toBe(true);
    });
  });

  describe('open()', () => {
    it('should set the view and return it', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new CanvasView(leaf).asOriginalType2__();

      const result = await leaf.open(view);

      expect(result).toBe(view);
      expect(leaf.view).toBe(view);
      expect(leaf.containerEl.contains(view.containerEl)).toBe(true);
    });

    it('should close the outgoing view and detach its element', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const first = new CanvasView(leaf);
      await leaf.open(first.asOriginalType2__());

      await leaf.open(null);

      expect(leaf.view).toBe(leaf._empty);
      expect(leaf.containerEl.contains(first.containerEl)).toBe(false);
      expect(first._loaded).toBe(false);
    });

    it('should do nothing when the view is already open', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const view = new CanvasView(leaf);
      await leaf.open(view.asOriginalType2__());
      const closeSpy = vi.spyOn(view, 'close');

      await leaf.open(view.asOriginalType2__());

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should log a view that fails to close and open the next one anyway', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const failing = new CanvasView(leaf);
      await leaf.open(failing.asOriginalType2__());
      vi.spyOn(failing, 'close').mockRejectedValue(new Error('Close failed'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);

      await leaf.open(null);

      expect(errorSpy).toHaveBeenCalledWith('Failed to close view', expect.any(Error));
      expect(leaf.view).toBe(leaf._empty);
      errorSpy.mockRestore();
    });

    it('should log a view that fails to open and still hold it', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const failing = new CanvasView(leaf);
      vi.spyOn(failing, 'open').mockRejectedValue(new Error('Open failed'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);

      await leaf.open(failing.asOriginalType2__());

      expect(errorSpy).toHaveBeenCalledWith('Failed to open view', expect.any(Error));
      expect(leaf.view).toBe(failing);
      errorSpy.mockRestore();
    });
  });

  describe('openFile()', () => {
    it('should open a Markdown file in a Markdown view holding it', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = WorkspaceLeaf.create2__(app);
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));

      await leaf.openFile(file);

      expect(leaf.view).toBeInstanceOf(MarkdownView);
      expect(leaf.file__).toBe(file);
      expect(leaf.getDisplayText()).toBe('note');
    });

    it('should reuse the open view when it already accepts the extension', async () => {
      const app = App.createConfigured__({ files: { 'first.md': '', 'second.md': '' } });
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('first.md')));
      const view = leaf.view;

      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('second.md')));

      expect(leaf.view).toBe(view);
      expect(leaf.file__?.path).toBe('second.md');
    });

    it('should change nothing for an extension no view type is registered for', async () => {
      const app = App.createConfigured__({ files: { 'image.png': '' } });
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('image.png')));

      expect(leaf.view).toBe(leaf._empty);
    });

    it('should activate the leaf when asked, and carry the ephemeral state', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      const file = ensureNonNullable(app.vault.getFileByPath('note.md'));

      // eslint-disable-next-line unicorn/name-replacements -- `eState` is Obsidian's own spelling on `OpenViewState`.
      await leaf.openFile(file, { active: true, eState: { line: 3 } });

      expect(app.workspace.activeLeaf).toBe(leaf);
      expect(leaf.getEphemeralState()).toEqual({ line: 3 });
    });

    it('should join the given leaf\'s link group', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const other = WorkspaceLeaf.create2__(app);
      other.setGroup('shared');
      const leaf = WorkspaceLeaf.create2__(app);

      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('note.md')), { group: other.asOriginalType3__() });

      expect(leaf.getGroup__()).toBe('shared');
    });
  });

  describe('tab header', () => {
    it('should build the header Obsidian builds, element for element', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);

      expect(leaf.tabHeaderEl.className).toBe('workspace-tab-header tappable');
      expect(leaf.tabHeaderEl.draggable).toBe(true);
      const innerEl = ensureNonNullable(leaf.tabHeaderEl.firstElementChild);
      expect(innerEl.className).toBe('workspace-tab-header-inner');
      expect([...innerEl.children]).toEqual([
        leaf.tabHeaderInnerIconEl,
        leaf.tabHeaderInnerTitleEl,
        leaf.tabHeaderStatusContainerEl,
        leaf.tabHeaderCloseEl
      ]);
      expect(leaf.tabHeaderInnerIconEl.className).toBe('workspace-tab-header-inner-icon');
      expect(leaf.tabHeaderInnerTitleEl.className).toBe('workspace-tab-header-inner-title');
      expect(leaf.tabHeaderStatusContainerEl.className).toBe('workspace-tab-header-status-container');
      expect(leaf.tabHeaderCloseEl.className).toBe('workspace-tab-header-inner-close-button');
      expect(leaf.tabHeaderCloseEl.dataset['icon']).toBe('lucide-x');
      expect(leaf.tabHeaderCloseEl.getAttribute('aria-label')).toBe('Close');
    });

    it('should let a consumer append an indicator to the status container of a leaf holding a note', async () => {
      const app = App.createConfigured__({ files: { 'note.md': 'content' } });
      const leaf = app.workspace.getLeaf(true);
      await leaf.openFile(ensureNonNullable(app.vault.getFileByPath('note.md')));

      // The route a lock indicator takes: from the view, back to its leaf, through the strict proxy.
      expect(leaf.view).toBeInstanceOf(MarkdownView);
      const statusContainerEl = WorkspaceLeaf.fromOriginalType3__(leaf.view.leaf).tabHeaderStatusContainerEl;
      const indicatorEl = statusContainerEl.createSpan({ cls: 'lock-indicator' });

      expect(leaf.tabHeaderEl.querySelector('.lock-indicator')).toBe(indicatorEl);
    });
  });

  describe('file__', () => {
    it('should return null for a leaf showing the empty view', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      expect(leaf.file__).toBeNull();
    });

    it('should return null for a view that is not a file view', async () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      await leaf.open(new CanvasView(leaf).asOriginalType2__());
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

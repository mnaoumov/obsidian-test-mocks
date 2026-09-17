/**
 * @file
 *
 * Mock of Obsidian's `Workspace`, which manages the app's leaves, splits and layout.
 */

import type {
  Constructor as ConstructorOriginal,
  MarkdownFileInfo as MarkdownFileInfoOriginal,
  Menu as MenuOriginal,
  OpenViewState as OpenViewStateOriginal,
  PaneType as PaneTypeOriginal,
  Side as SideOriginal,
  SplitDirection as SplitDirectionOriginal,
  View as ViewOriginal,
  Workspace as WorkspaceOriginal,
  WorkspaceParent as WorkspaceParentOriginal,
  WorkspaceWindowInitData as WorkspaceWindowInitDataOriginal
} from 'obsidian';

import type {
  WorkspaceEnsureSideLeafOptions,
  WorkspaceSetActiveLeafOptions
} from '../internal/types.ts';
import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { WorkspaceItem } from './WorkspaceItem.ts';

import { castTo } from '../internal/castTo.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { isParentPlaceholder } from '../internal/workspace-layout.ts';
import { Events } from './Events.ts';
import { debounce } from './functions/debounce.ts';
import { WorkspaceFloating } from './WorkspaceFloating.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';
import { WorkspaceTabs } from './WorkspaceTabs.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

/**
 * Mock of Obsidian's `Workspace`.
 *
 * Leaves live in a real layout tree, as in Obsidian: tab groups inside the root split, the two sidebars, and the
 * popout windows under {@link Workspace.floatingSplit}. Methods that create a leaf place it where Obsidian would,
 * lookups and iterators walk the tree, and the layout-ready state is driven by the test through
 * {@link Workspace.setLayoutReady__}. Nothing is rendered, and leaves are always treated as visible.
 */
export class Workspace extends Events {
  /**
   * The editor component of the active view, or `null` when it has none. The mock never sets it.
   */
  public activeEditor: MarkdownFileInfoOriginal | null = null;
  /**
   * The currently focused leaf, if any. Obsidian discourages reading it in favor of
   * {@link Workspace.getActiveViewOfType} and {@link Workspace.getLeaf}.
   */
  public activeLeaf: null | WorkspaceLeaf = null;
  /**
   * The workspace's root element.
   */
  public containerEl: HTMLElement;
  /**
   * The parent of every popout window.
   */
  public floatingSplit: WorkspaceFloating;
  /**
   * Whether the layout has been initialized; `false` until {@link Workspace.setLayoutReady__} is called.
   */
  public layoutReady = false;
  /**
   * The ribbon on the left edge of the app.
   */
  public leftRibbon: WorkspaceRibbon;
  /**
   * The left sidebar.
   */
  public leftSplit: WorkspaceSidedock;

  /**
   * Requests a debounced save of the workspace layout. Debounces a no-op in the mock.
   */
  public requestSaveLayout = debounce(noop);

  /**
   * The ribbon on the right edge of the app. Obsidian deprecates it as no longer used.
   */
  public rightRibbon: WorkspaceRibbon;
  /**
   * The right sidebar.
   */
  public rightSplit: WorkspaceSidedock;

  /**
   * The main area's root split.
   */
  public rootSplit: WorkspaceRoot;

  private readonly app: App;

  private lastActiveTime = 0;
  private layoutReadyCallbacks: (() => unknown)[] = [];
  /**
   * Creates the workspace with its ribbons, sidebars, root split and floating split, and no leaves.
   *
   * @param app - The app the workspace belongs to.
   * @param containerEl - The workspace's root element.
   */
  protected constructor(app: App, containerEl: HTMLElement) {
    super();
    this.app = app;
    this.containerEl = containerEl;
    this.floatingSplit = WorkspaceFloating.create2__(this);
    this.leftRibbon = WorkspaceRibbon.create__(this, 'left');
    this.leftSplit = WorkspaceSidedock.create3__(this, 'vertical', 'left');
    this.rightRibbon = WorkspaceRibbon.create__(this, 'right');
    this.rightSplit = WorkspaceSidedock.create3__(this, 'vertical', 'right');
    this.rootSplit = WorkspaceRoot.create3__(this, 'vertical');
    const self = strictProxy(this);
    self.constructor2__(app, containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a workspace, spyable via `vi.spyOn(Workspace, 'create2__')`. It is numbered because
   * `Events.create__` takes no arguments, so a `create__` here would conflict on the static side.
   *
   * @param app - The app the workspace belongs to.
   * @param containerEl - The workspace's root element.
   * @returns The new workspace.
   */
  public static create2__(app: App, containerEl: HTMLElement): Workspace {
    return new Workspace(app, containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Workspace` as this mock.
   *
   * @param value - The value typed as the original `Workspace`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: WorkspaceOriginal): Workspace {
    return strictProxy(value, Workspace);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Workspace` type.
   *
   * @returns The same object, typed as the original `Workspace`.
   */
  public asOriginalType2__(): WorkspaceOriginal {
    return strictProxy<WorkspaceOriginal>(this);
  }

  /**
   * Replaces the workspace layout with a serialized one. A no-op in the mock.
   *
   * @param _workspace - The serialized layout.
   */
  public async changeLayout(_workspace: unknown): Promise<void> {
    await noopAsync();
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Workspace.prototype, 'constructor2__')`.
   *
   * @param _app - The app the workspace was created with.
   * @param _containerEl - The root element the workspace was created with.
   */
  public constructor2__(_app: App, _containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Splits a leaf, creating a new leaf in its own tab group beside it, as Obsidian does: next to the leaf's tab group
   * when the nearest split already runs in `direction`, and otherwise inside a new split of that direction that takes
   * the tab group's place. A leaf outside the layout has nothing to split, so the mock adds the new leaf to the root
   * tab group instead.
   *
   * @param leaf - The leaf to split.
   * @param direction - Whether to split vertically (side by side) or horizontally (stacked); `'vertical'` by default.
   * @param before - Whether to place the new leaf before the existing one.
   * @returns The new leaf.
   */
  public createLeafBySplit(leaf: WorkspaceLeaf, direction: SplitDirectionOriginal = 'vertical', before = false): WorkspaceLeaf {
    const newLeaf = WorkspaceLeaf.create2__(this.app);

    let child: WorkspaceItem = leaf;
    let ancestor = getParent(leaf);
    while (ancestor && !(ancestor instanceof WorkspaceSplit)) {
      child = ancestor;
      ancestor = getParent(ancestor);
    }

    if (!ancestor) {
      this.getRootTabGroup().insertChild(-1, newLeaf);
      return newLeaf;
    }

    const tabs = WorkspaceTabs.create2__(this);
    tabs.insertChild(0, newLeaf);
    const index = ancestor.children.indexOf(child);

    if (direction === ancestor.direction) {
      ancestor.insertChild(before ? index : index + 1, tabs);
      return newLeaf;
    }

    const split = WorkspaceSplit.create2__(this, direction);
    // eslint-disable-next-line unicorn/prefer-modern-dom-apis -- `WorkspaceParent.replaceChild` is Obsidian's layout method, not the DOM's; the autofix would rewrite it into a DOM `replaceWith` call.
    ancestor.replaceChild(index, split);
    split.insertChild(0, before ? tabs : child);
    split.insertChild(1, before ? child : tabs);
    return newLeaf;
  }

  /**
   * Creates a leaf at an index inside a parent.
   *
   * @param parent - The parent to create the leaf in.
   * @param index - The position within the parent; a negative or out-of-range index appends.
   * @returns The new leaf.
   */
  public createLeafInParent(parent: WorkspaceParentOriginal, index: number): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    WorkspaceParent.fromOriginalType3__(parent).insertChild(index, leaf);
    return leaf;
  }

  /**
   * Detaches every leaf whose view state has the given type.
   *
   * @param viewType - The view type to remove.
   */
  public detachLeavesOfType(viewType: string): void {
    for (const leaf of this.getLeavesOfType(viewType)) {
      leaf.detach();
    }
  }

  /**
   * Duplicates a leaf into a new tab, split or window, copying its view state and ephemeral state. `'split'`, or a
   * split direction in place of the leaf type, splits the leaf; anything else asks {@link Workspace.getLeaf}.
   *
   * @param leaf - The leaf to duplicate.
   * @param leafType - Where to open the duplicate, or the split direction.
   * @param direction - The split direction, when splitting.
   * @returns The new leaf.
   */
  public async duplicateLeaf(
    leaf: WorkspaceLeaf,
    leafType?: boolean | PaneTypeOriginal | SplitDirectionOriginal,
    direction?: SplitDirectionOriginal
  ): Promise<WorkspaceLeaf> {
    let paneType = leafType;
    let splitDirection = direction;
    if (paneType === 'horizontal' || paneType === 'vertical') {
      splitDirection = paneType;
      paneType = 'split';
    }

    const newLeaf = paneType === 'split' ? this.createLeafBySplit(leaf, splitDirection) : this.getLeaf(paneType);
    await newLeaf.setViewState(leaf.getViewState(), { ...leaf.getEphemeralState(), focus: true });
    return newLeaf;
  }

  /**
   * Gets a sidebar leaf of the given type, as Obsidian does: the first leaf of that type anywhere, or a new leaf from
   * {@link Workspace.getLeftLeaf} / {@link Workspace.getRightLeaf}. The leaf's view state is set when a state is given
   * or its type differs; the leaf is then revealed unless `reveal` is `false`, and made active when `active` is set.
   *
   * @param type - The view type.
   * @param side - Which sidebar to create the leaf in.
   * @param options - Whether to activate, split or reveal the leaf, and the state to give it.
   * @returns The leaf.
   */
  public async ensureSideLeaf(type: string, side: SideOriginal, options: WorkspaceEnsureSideLeafOptions = {}): Promise<WorkspaceLeaf> {
    const shouldActivate = options.active ?? false;
    const shouldReveal = options.reveal ?? true;
    const shouldSplit = options.split ?? false;

    const existingLeaf = this.getLeavesOfType(type)[0];
    // A sidebar is always a `WorkspaceSidedock` here, so a new leaf always lands in its first tab group.
    const leaf = existingLeaf ?? castTo<WorkspaceLeaf>(side === 'left' ? this.getLeftLeaf(shouldSplit) : this.getRightLeaf(shouldSplit));

    if (shouldActivate || shouldReveal) {
      await leaf.loadIfDeferred();
    }

    if (options.state || leaf.getViewState().type !== type) {
      await leaf.setViewState(
        options.state ? { state: castTo<Record<string, unknown>>(options.state), type } : { type }
      );
    }

    if (shouldReveal) {
      await this.revealLeaf(leaf);
    }

    if (shouldActivate) {
      this.setActiveLeaf(leaf, { focus: true });
    }

    return leaf;
  }

  /**
   * Gets the file of the active view, or the most recently active file. The mock returns the active leaf's file.
   *
   * @returns The file, or `null` when there is no active leaf or it has no file.
   */
  public getActiveFile(): null | TFile {
    return this.activeLeaf ? this.activeLeaf.file__ : null;
  }

  /**
   * Gets the active leaf's view when it is an instance of the given class.
   *
   * @typeParam T - The view class.
   * @param type - The view constructor to match.
   * @returns The active leaf's view, or `null` when there is no active leaf or its view is not a `type`.
   */
  public getActiveViewOfType<T extends ViewOriginal>(type: ConstructorOriginal<T>): null | T {
    const view = this.activeLeaf?.view;
    return view instanceof type ? view : null;
  }

  /**
   * Gets all leaves that belong to a linked group.
   *
   * @param group - The group id.
   * @returns The leaves whose group is `group`; empty for an empty group id.
   */
  public getGroupLeaves(group: string): WorkspaceLeaf[] {
    const leaves: WorkspaceLeaf[] = [];
    if (!group) {
      return leaves;
    }

    this.iterateAllLeaves((leaf) => {
      if (leaf.getGroup__() === group) {
        leaves.push(leaf);
      }
    });
    return leaves;
  }

  /**
   * Gets the paths of the ten most recently opened files.
   *
   * @returns The paths; always empty in the mock.
   */
  public getLastOpenFiles(): string[] {
    return [];
  }

  /**
   * Serializes the workspace layout.
   *
   * @returns The layout; always an empty object in the mock.
   */
  public getLayout(): Record<string, unknown> {
    return {};
  }

  /**
   * Gets a leaf to open something in. `'split'` splits the most recent leaf, `'tab'` or `true` adds a tab next to the
   * most recently active one, and `'window'` opens a popout window. `false` or omitted returns the active leaf,
   * creating one in the root tab group and making it active when there is none.
   *
   * @param newLeaf - Whether, and where, to create a new leaf.
   * @param direction - The split direction, for `'split'`.
   * @returns The leaf.
   */
  public getLeaf(newLeaf?: boolean | PaneTypeOriginal, direction?: SplitDirectionOriginal): WorkspaceLeaf {
    if (newLeaf === 'split') {
      return this.splitActiveLeaf(direction);
    }

    if (newLeaf === 'tab' || newLeaf === true) {
      return this.createLeafInMostRecentTabGroup();
    }

    if (newLeaf === 'window') {
      return this.openPopoutLeaf();
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    this.getRootTabGroup().insertChild(-1, leaf);
    this.setActiveLeaf(leaf);
    return leaf;
  }

  /**
   * Gets a leaf by its id.
   *
   * @param id - The leaf id.
   * @returns The leaf, or `null` when no leaf in the layout has that id.
   */
  public getLeafById(id: string): null | WorkspaceLeaf {
    return findLeaf([this.rootSplit, this.leftSplit, this.rightSplit, this.floatingSplit], (leaf) => leaf.id__ === id);
  }

  /**
   * Gets every leaf whose view state has the given type.
   *
   * @param viewType - The view type.
   * @returns The matching leaves.
   */
  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    const leaves: WorkspaceLeaf[] = [];
    this.iterateAllLeaves((leaf) => {
      if (leaf.getViewState().type === viewType) {
        leaves.push(leaf);
      }
    });
    return leaves;
  }

  /**
   * Creates a leaf in the left sidebar: in a new tab group when `split` is set, and otherwise in the sidebar's first
   * tab group, which is created when the sidebar is empty.
   *
   * @param split - Whether to put the leaf in a new tab group.
   * @returns The new leaf, or `null` when the sidebar's first child is not a parent that can hold it.
   */
  public getLeftLeaf(split: boolean): null | WorkspaceLeaf {
    return this.createSidebarLeaf(this.leftSplit, split);
  }

  /**
   * Gets the most recently active leaf in a part of the layout: the leaf with the highest
   * {@link WorkspaceLeaf.activeTime}, or the first leaf found when none was ever active.
   *
   * @param root - The part of the layout to search; the root split and the popout windows by default, as in Obsidian.
   * @returns The leaf, or `null` when there are no leaves there.
   */
  public getMostRecentLeaf(root?: WorkspaceParentOriginal): null | WorkspaceLeaf {
    let mostRecent: null | WorkspaceLeaf = null;
    const items = root ? [WorkspaceParent.fromOriginalType3__(root)] : [this.rootSplit, this.floatingSplit];
    iterateLeaves(items, (leaf) => {
      if (!mostRecent || mostRecent.activeTime < leaf.activeTime) {
        mostRecent = leaf;
      }
    });
    return mostRecent;
  }

  /**
   * Creates a leaf in the right sidebar: in a new tab group when `split` is set, and otherwise in the sidebar's first
   * tab group, which is created when the sidebar is empty.
   *
   * @param split - Whether to put the leaf in a new tab group.
   * @returns The new leaf, or `null` when the sidebar's first child is not a parent that can hold it.
   */
  public getRightLeaf(split: boolean): null | WorkspaceLeaf {
    return this.createSidebarLeaf(this.rightSplit, split);
  }

  /**
   * Gets a leaf that is not pinned, creating one when every leaf is pinned. It searches the container of the active
   * leaf, or the root split when there is none, so a sidebar leaf is never picked. Obsidian deprecates it in favor of
   * `getLeaf(false)`.
   *
   * @returns The first unpinned leaf there, or a new one in the root tab group.
   */
  public getUnpinnedLeaf(): WorkspaceLeaf {
    const container = this.activeLeaf ? WorkspaceParent.fromOriginalType3__(this.activeLeaf.getContainer()) : this.rootSplit;
    const unpinned = findLeaf([container], (leaf) => !leaf.isPinned__());
    if (unpinned) {
      return unpinned;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    this.getRootTabGroup().insertChild(-1, leaf);
    return leaf;
  }

  /**
   * Adds the internal-link items to a context menu. A no-op in the mock.
   *
   * @param _menu - The menu to add to.
   * @param _linktext - The link text.
   * @param _sourcePath - The path of the note containing the link.
   * @param _leaf - The leaf the link is in.
   * @returns Whether items were added; always `false` in the mock.
   */
  public handleLinkContextMenu(_menu: MenuOriginal, _linktext: string, _sourcePath: string, _leaf?: WorkspaceLeaf): boolean {
    return false;
  }

  /**
   * Calls the callback on every leaf, in Obsidian's order: the root split, the left sidebar, the right sidebar, then
   * the popout windows.
   *
   * @param callback - Called with each leaf.
   */
  public iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    iterateLeaves([this.rootSplit, this.leftSplit, this.rightSplit, this.floatingSplit], callback);
  }

  /**
   * Calls the callback on every leaf in the root split: the main area, without the sidebars or popout windows.
   *
   * @param callback - Called with each leaf.
   */
  public iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    iterateLeaves([this.rootSplit], callback);
  }

  /**
   * Moves a leaf into a new popout window, in a tab group of its own. The mock never throws for a missing popout
   * capability.
   *
   * @param leaf - The leaf to move.
   * @param _data - The window's initial size and position; not kept by the mock.
   * @returns The new window.
   */
  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitDataOriginal): WorkspaceWindow {
    const win = this.createPopoutWindow();
    getParent(leaf)?.removeChild(leaf);
    const tabs = WorkspaceTabs.create2__(this);
    tabs.insertChild(0, leaf);
    win.insertChild(0, tabs);
    return win;
  }

  /**
   * Runs the callback now if the layout is ready, or queues it until {@link Workspace.setLayoutReady__} is called.
   *
   * @param callback - The callback to run.
   */
  public onLayoutReady(callback: () => unknown): void {
    if (this.layoutReady) {
      callback();
    } else {
      this.layoutReadyCallbacks.push(callback);
    }
  }

  /**
   * Opens the file a link resolves to, via `metadataCache.getFirstLinkpathDest`, in the leaf {@link Workspace.getLeaf}
   * picks, and makes that leaf active. Does nothing when the link resolves to no file.
   *
   * @param linktext - The link text to resolve.
   * @param sourcePath - The path of the note the link is in.
   * @param newLeaf - Whether, and where, to open a new leaf.
   * @param _openViewState - The view state to open with; ignored by the mock.
   */
  public async openLinkText(
    linktext: string,
    sourcePath: string,
    newLeaf?: boolean | PaneTypeOriginal,
    _openViewState?: OpenViewStateOriginal
  ): Promise<void> {
    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, sourcePath);
    if (!file) {
      return;
    }

    const leaf = this.getLeaf(newLeaf);
    await leaf.openFile(file);
    this.setActiveLeaf(leaf);
  }

  /**
   * Opens a popout window with a single new leaf, in a tab group of its own.
   *
   * @param _data - The window's initial size and position; not kept by the mock.
   * @returns The new leaf.
   */
  public openPopoutLeaf(_data?: WorkspaceWindowInitDataOriginal): WorkspaceLeaf {
    const win = this.createPopoutWindow();
    const leaf = WorkspaceLeaf.create2__(this.app);
    const tabs = WorkspaceTabs.create2__(this);
    tabs.insertChild(0, leaf);
    win.insertChild(0, tabs);
    return leaf;
  }

  /**
   * Mock-only: removes a leaf from the layout tree, clearing {@link Workspace.activeLeaf} if it was active; called when
   * a leaf detaches.
   *
   * @param leaf - The leaf to remove.
   */
  public removeLeaf__(leaf: WorkspaceLeaf): void {
    getParent(leaf)?.removeChild(leaf);
    if (this.activeLeaf === leaf) {
      this.activeLeaf = null;
    }
  }

  /**
   * Brings a leaf to the foreground: expands its sidebar when that is collapsed, then loads the leaf if deferred. As
   * in Obsidian, it does not make the leaf active.
   *
   * @param leaf - The leaf to reveal.
   */
  public async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    const root = leaf.getRoot();
    if (root instanceof WorkspaceSidedock && root.collapsed) {
      root.expand();
    }
    await leaf.loadIfDeferred();
  }

  /**
   * Makes a leaf active, stamps its {@link WorkspaceLeaf.activeTime}, and fires `active-leaf-change`. A leaf outside
   * the layout is first added to the root tab group, where Obsidian would ignore it.
   *
   * @param leaf - The new active leaf.
   * @param _options - Whether to focus the leaf; ignored by the mock.
   */
  public setActiveLeaf(leaf: WorkspaceLeaf, _options?: WorkspaceSetActiveLeafOptions): void {
    if (!this.isInLayout(leaf)) {
      getParent(leaf)?.removeChild(leaf);
      this.getRootTabGroup().insertChild(-1, leaf);
    }

    this.activeLeaf = leaf;
    // Obsidian stamps `Date.now()`; kept strictly increasing so two activations in the same millisecond still order.
    this.lastActiveTime = Math.max(Date.now(), this.lastActiveTime + 1);
    leaf.activeTime = this.lastActiveTime;
    this.trigger('active-leaf-change', leaf);
  }

  /**
   * Mock-only: simulates the layout becoming ready: sets {@link Workspace.layoutReady} and runs, then clears, the
   * callbacks queued by {@link Workspace.onLayoutReady}.
   */
  public setLayoutReady__(): void {
    this.layoutReady = true;
    for (const callback of this.layoutReadyCallbacks) {
      callback();
    }
    this.layoutReadyCallbacks = [];
  }

  /**
   * Splits the most recently active leaf, or creates a leaf at the start of the root split when there is none.
   * Obsidian deprecates it in favor of `getLeaf('split')`.
   *
   * @param direction - Whether to split vertically or horizontally.
   * @returns The new leaf.
   */
  public splitActiveLeaf(direction?: SplitDirectionOriginal): WorkspaceLeaf {
    const mostRecentLeaf = this.getMostRecentLeaf();
    return mostRecentLeaf
      ? this.createLeafBySplit(mostRecentLeaf, direction)
      : this.createLeafInParent(this.rootSplit.asOriginalType3__(), 0);
  }

  /**
   * Reconfigures the options of every Markdown view. A no-op in the mock.
   */
  public updateOptions(): void {
    noop();
  }

  private createLeafInMostRecentTabGroup(): WorkspaceLeaf {
    const mostRecentLeaf = this.getMostRecentLeaf();
    const group = (mostRecentLeaf && getParent(mostRecentLeaf)) ?? this.getRootTabGroup();

    let index = group.children.length - 1;
    let latest = group.children.at(index);
    for (const [childIndex, child] of group.children.entries()) {
      if (!(child instanceof WorkspaceLeaf && latest instanceof WorkspaceLeaf && child.activeTime > latest.activeTime)) {
        continue;
      }
      latest = child;
      index = childIndex;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    group.insertChild(index + 1, leaf);
    return leaf;
  }

  private createPopoutWindow(): WorkspaceWindow {
    const win = WorkspaceWindow.create3__(this);
    this.floatingSplit.insertChild(-1, win);
    return win;
  }

  private createSidebarLeaf(sidedock: WorkspaceSidedock, split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    if (split) {
      const tabs = WorkspaceTabs.create2__(this);
      sidedock.insertChild(-1, tabs);
      tabs.insertChild(-1, leaf);
      return leaf;
    }

    if (sidedock.children.length === 0) {
      sidedock.insertChild(0, WorkspaceTabs.create2__(this));
    }

    const firstChild = sidedock.children.at(0);
    if (firstChild instanceof WorkspaceParent) {
      firstChild.insertChild(-1, leaf);
      return leaf;
    }

    return null;
  }

  private getRootTabGroup(): WorkspaceTabs {
    for (const child of this.rootSplit.children) {
      if (child instanceof WorkspaceTabs) {
        return child;
      }
    }

    const tabs = WorkspaceTabs.create2__(this);
    this.rootSplit.insertChild(-1, tabs);
    return tabs;
  }

  private isInLayout(leaf: WorkspaceLeaf): boolean {
    const layoutRoots: WorkspaceItem[] = [this.rootSplit, this.leftSplit, this.rightSplit, this.floatingSplit];
    return layoutRoots.includes(leaf.getRoot());
  }
}

function findLeaf(items: readonly WorkspaceItem[], predicate: (leaf: WorkspaceLeaf) => boolean): null | WorkspaceLeaf {
  for (const item of items) {
    if (item instanceof WorkspaceLeaf) {
      if (predicate(item)) {
        return item;
      }
    } else if (item instanceof WorkspaceParent) {
      const found = findLeaf(item.children, predicate);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function getParent(item: WorkspaceItem): null | WorkspaceParent {
  return isParentPlaceholder(item.parent) ? null : WorkspaceParent.fromOriginalType3__(item.parent);
}

function iterateLeaves(items: readonly WorkspaceItem[], callback: (leaf: WorkspaceLeaf) => unknown): void {
  for (const item of items) {
    if (item instanceof WorkspaceLeaf) {
      callback(item);
    } else if (item instanceof WorkspaceParent) {
      iterateLeaves([...item.children], callback);
    }
  }
}

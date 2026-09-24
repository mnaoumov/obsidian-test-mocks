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
import { EmptyView } from '../internal/empty-view.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
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

// Obsidian's `focusNewTab` vault setting, which decides whether a leaf created in a tab group becomes active.
const FOCUS_NEW_TAB_CONFIG_KEY = 'focusNewTab';

// The flex-grow total a split's children share, which `createLeafInParent` divides between them.
const FULL_DIMENSION = 100;

// A split shares its dimension between the two items on either side of it.
const SPLIT_DIMENSION_SHARE = 2;

// Obsidian debounces its `layout-change` trigger by this many milliseconds.
const LAYOUT_CHANGE_DEBOUNCE_MS = 10;

/**
 * Mock of Obsidian's `Workspace`.
 *
 * Leaves live in a real layout tree, as in Obsidian: tab groups inside the root split, the two sidebars, and the
 * popout windows under {@link Workspace.floatingSplit}. Methods that create a leaf place it where Obsidian would and
 * make it active, lookups and iterators walk the tree, and every layout change runs through
 * {@link Workspace.onLayoutChange} into {@link Workspace.updateLayout}, which re-picks an active leaf and re-populates
 * an emptied root split.
 *
 * The layout-ready state is driven by the test through {@link Workspace.setLayoutReady__}, and it is load-bearing:
 * exactly as in Obsidian, {@link Workspace.updateLayout} and {@link Workspace.activeLeafEvents} do nothing until it is
 * set, so `active-leaf-change`, `file-open` and `layout-change` do not fire in a workspace that was never made ready.
 *
 * Nothing is rendered, and leaves are always treated as visible.
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
   * The tab group the active leaf sits in, or `null` when it sits in something else or there is no active leaf.
   */
  public activeTabGroup: null | WorkspaceTabs = null;
  /**
   * The workspace's root element.
   */
  public containerEl: HTMLElement;
  /**
   * The parent of every popout window.
   */
  public floatingSplit: WorkspaceFloating;
  /**
   * The file `file-open` was last fired for, which is what {@link Workspace.activeLeafEvents} compares against to
   * decide whether to fire it again.
   */
  public lastActiveFile: null | TFile = null;
  /**
   * Whether the last tab group to lose its final leaf was stacked. {@link Workspace.updateLayout} gives the group it
   * re-creates in an emptied root split the same stacking.
   */
  public lastTabGroupStacked = false;
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
   * Requests a debounced run of {@link Workspace.activeLeafEvents}, as Obsidian does. Call `run()` on it to fire the
   * pending events at once instead of waiting for the timer.
   */
  public requestActiveLeafEvents = debounce(this.activeLeafEvents.bind(this));

  /**
   * Requests a debounced `layout-change` trigger, as Obsidian does. Call `run()` on it to fire a pending event at once
   * instead of waiting for the timer.
   */
  public requestLayoutChangeEvents = debounce(this.layoutChangeEvents.bind(this), LAYOUT_CHANGE_DEBOUNCE_MS);

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

  private isUpdateLayoutQueued = false;
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
   * Fires the events that follow an active-leaf change: `active-leaf-change`, then `file-open` when the active file
   * changed too. {@link Workspace.setActiveLeaf} asks for it through {@link Workspace.requestActiveLeafEvents} rather
   * than calling it directly. As in Obsidian, it does nothing until the layout is ready.
   */
  public activeLeafEvents(): void {
    if (!this.layoutReady) {
      return;
    }

    this.trigger('active-leaf-change', this.activeLeaf);

    const file = this.getActiveFile();
    if (this.lastActiveFile === file) {
      return;
    }

    this.lastActiveFile = file;
    this.trigger('file-open', file);
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
   * Splits a leaf, creating a new leaf in its own tab group beside it and making it active, as Obsidian does.
   *
   * @param leaf - The leaf to split.
   * @param direction - Whether to split vertically (side by side) or horizontally (stacked); `'vertical'` by default.
   * @param before - Whether to place the new leaf before the existing one.
   * @returns The new leaf.
   */
  public createLeafBySplit(leaf: WorkspaceLeaf, direction: SplitDirectionOriginal = 'vertical', before = false): WorkspaceLeaf {
    const newLeaf = WorkspaceLeaf.create2__(this.app);
    this.splitLeaf(leaf, newLeaf, direction, before);
    this.setActiveLeaf(newLeaf);
    return newLeaf;
  }

  /**
   * Creates a leaf at an index inside a parent and makes it active, as Obsidian does. A parent that already holds
   * children gives the new leaf an equal share of them.
   *
   * @param parent - The parent to create the leaf in.
   * @param index - The position within the parent; a negative or out-of-range index appends.
   * @returns The new leaf.
   */
  public createLeafInParent(parent: WorkspaceParentOriginal, index: number): WorkspaceLeaf {
    const target = WorkspaceParent.fromOriginalType3__(parent);
    const leaf = WorkspaceLeaf.create2__(this.app);
    if (target.children.length > 0) {
      leaf.setDimension(FULL_DIMENSION / target.children.length);
    }
    target.insertChild(index, leaf);
    this.setActiveLeaf(leaf);
    return leaf;
  }

  /**
   * Creates a leaf in a tab group, after the group's most recently active tab, as Obsidian does — and makes it active
   * when the vault's `focusNewTab` setting is on, which it is by default. When that most recently active tab is
   * already showing the empty view, Obsidian hands it back instead of creating anything, and without activating it;
   * the mock asks the same question its own way. So two `getLeaf('tab')` calls with nothing done to the leaf in
   * between answer with the same leaf, exactly as the real app does.
   *
   * One departure. Obsidian throws `No tab group found.` when no group is given and no leaf was ever active; the
   * mock falls back to the root tab group, creating it when the root split is empty, so `getLeaf('tab')` works on a
   * workspace no test has populated.
   *
   * @param tabs - The group to create the leaf in; the most recently active leaf's group by default.
   * @returns The new leaf.
   */
  public createLeafInTabGroup(tabs?: WorkspaceParentOriginal): WorkspaceLeaf {
    const group = tabs ? WorkspaceParent.fromOriginalType3__(tabs) : this.getMostRecentTabGroup();

    let index = group.children.length - 1;
    let latest = group.children.at(index);
    for (const [childIndex, child] of group.children.entries()) {
      if (!(child instanceof WorkspaceLeaf && latest instanceof WorkspaceLeaf && child.activeTime > latest.activeTime)) {
        continue;
      }
      latest = child;
      index = childIndex;
    }

    if (latest instanceof WorkspaceLeaf && latest.view instanceof EmptyView) {
      return latest;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    group.insertChild(index + 1, leaf);
    if (this.app.vault.getConfig(FOCUS_NEW_TAB_CONFIG_KEY)) {
      this.setActiveLeaf(leaf);
    }
    return leaf;
  }

  /**
   * Detaches every leaf showing the given view type.
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

    if (options.state || leaf.view.getViewType() !== type) {
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
   * Gets the container the workspace considers focused. The mock has one window, so it is always the root split —
   * which is what Obsidian answers whenever its focused window is the main one.
   *
   * @returns The root split.
   */
  public getFocusedContainer(): WorkspaceRoot {
    return this.rootSplit;
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
   * most recently active one, and `'window'` opens a popout window. `false` or omitted asks
   * {@link Workspace.getUnpinnedLeaf}.
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
      return this.createLeafInTabGroup();
    }

    return newLeaf === 'window' ? this.openPopoutLeaf() : this.getUnpinnedLeaf();
  }

  /**
   * Gets a leaf by its id.
   *
   * @param id - The leaf id.
   * @returns The leaf, or `null` when no leaf in the layout has that id.
   */
  public getLeafById(id: string): null | WorkspaceLeaf {
    let found: null | WorkspaceLeaf = null;
    this.iterateAllLeaves((leaf) => {
      if (leaf.id__ !== id) {
        return false;
      }
      found = leaf;
      return true;
    });
    return found;
  }

  /**
   * Gets every leaf showing the given view type, as its view reports it.
   *
   * @param viewType - The view type.
   * @returns The matching leaves.
   */
  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    const leaves: WorkspaceLeaf[] = [];
    this.iterateAllLeaves((leaf) => {
      if (leaf.view.getViewType() === viewType) {
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
    const items: WorkspaceItem[] = root ? [WorkspaceParent.fromOriginalType3__(root)] : [this.rootSplit, this.floatingSplit];
    this.iterateLeaves(items, (leaf) => {
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
   * Gets a leaf to navigate in, as Obsidian does, and makes it active unless told not to. Obsidian deprecates it in
   * favor of `getLeaf(false)`, which is a call to this.
   *
   * The active leaf is handed straight back when it can navigate — and is then NOT re-activated, since it already is.
   * Otherwise it searches the active leaf's container, or the root split when there is none, for the most recently
   * active leaf that can navigate and is its tab group's current tab (or sits in a stacked group). Failing that it
   * creates one beside the container's most recently active leaf.
   *
   * @param activate - Whether to make the leaf active; `true` by default, as in Obsidian.
   * @returns The leaf.
   */
  public getUnpinnedLeaf(activate = true): WorkspaceLeaf {
    const active = this.activeLeaf;
    if (active?.canNavigate()) {
      return active;
    }

    const container = active ? WorkspaceParent.fromOriginalType3__(active.getContainer()) : this.rootSplit;
    const leaf = this.findSelectedNavigableLeaf(container) ?? this.createLeafBesideMostRecent(container);
    if (activate) {
      this.setActiveLeaf(leaf);
    }
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
   * Checks whether an item is part of the layout: whether its root is one of the root split, the two sidebars or the
   * floating split.
   *
   * @param item - The item to check.
   * @returns Whether the item is attached.
   */
  public isAttached(item?: WorkspaceItem): boolean {
    if (!item) {
      return false;
    }

    const layoutRoots: WorkspaceItem[] = [this.leftSplit, this.rootSplit, this.floatingSplit, this.rightSplit];
    return layoutRoots.includes(item.getRoot());
  }

  /**
   * Calls the callback on every leaf, in Obsidian's order: the root split, the left sidebar, the right sidebar, then
   * the popout windows.
   *
   * A callback that returns a truthy value stops the walk of the part it is in — and, as in Obsidian, only that part:
   * the four walks are started independently and their answers are discarded, so stopping inside the root split does
   * not stop the sidebars.
   *
   * @param callback - Called with each leaf.
   */
  public iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    this.iterateLeaves(this.rootSplit, callback);
    this.iterateLeaves(this.leftSplit, callback);
    this.iterateLeaves(this.rightSplit, callback);
    this.iterateLeaves(this.floatingSplit, callback);
  }

  /**
   * Calls the callback on every leaf under an item, depth first. As in Obsidian, a callback that returns a truthy
   * value stops the walk.
   *
   * @param item - The item to walk, or several of them.
   * @param callback - Called with each leaf.
   * @returns Whether the walk was stopped by the callback.
   */
  public iterateLeaves(item: WorkspaceItem | WorkspaceItem[], callback: (leaf: WorkspaceLeaf) => unknown): boolean {
    if (Array.isArray(item)) {
      return item.some((child) => this.iterateLeaves(child, callback));
    }

    return item instanceof WorkspaceLeaf
      ? Boolean(callback(item))
      : item instanceof WorkspaceParent && [...item.children].some((child) => this.iterateLeaves(child, callback));
  }

  /**
   * Calls the callback on every leaf in the root split: the main area, without the sidebars or popout windows. A
   * callback that returns a truthy value stops the walk.
   *
   * @param callback - Called with each leaf.
   */
  public iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    this.iterateLeaves(this.rootSplit, callback);
  }

  /**
   * Moves a leaf into a new popout window, in a tab group of its own. The leaf gives up its share of the split it
   * came from, as in Obsidian. The mock never throws for a missing popout capability.
   *
   * @param leaf - The leaf to move.
   * @param _data - The window's initial size and position; not kept by the mock.
   * @returns The new window.
   */
  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitDataOriginal): WorkspaceWindow {
    const win = this.createPopoutWindow();
    getParent(leaf)?.removeChild(leaf);
    leaf.setDimension(null);
    const tabs = WorkspaceTabs.create2__(this);
    tabs.insertChild(0, leaf);
    win.insertChild(0, tabs);
    return win;
  }

  /**
   * Records that the layout changed, which asks for a debounced {@link Workspace.updateLayout}. `WorkspaceParent`
   * calls it whenever it adopts, releases or replaces a child.
   *
   * @param _item - The item whose children changed. Obsidian queues it for a dimension recompute, which the mock does
   * not model.
   */
  public onLayoutChange(_item?: WorkspaceItem): void {
    this.requestUpdateLayout();
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
   * Mock-only: removes a leaf from the layout tree; called when a leaf detaches.
   *
   * It does NOT clear {@link Workspace.activeLeaf}, because Obsidian does not either: a detached active leaf stays
   * there until {@link Workspace.updateLayout} notices it is no longer attached and picks another one, which the
   * layout change this removal causes asks for.
   *
   * @param leaf - The leaf to remove.
   */
  public removeLeaf__(leaf: WorkspaceLeaf): void {
    getParent(leaf)?.removeChild(leaf);
  }

  /**
   * Asks for a {@link Workspace.updateLayout} on a microtask, coalescing every request made before it runs — as
   * Obsidian does. Await a microtask (for example `await Promise.resolve()`) to let it run, or call `updateLayout()`
   * directly to do the work at once.
   */
  public requestUpdateLayout(): void {
    if (this.isUpdateLayoutQueued) {
      return;
    }

    this.isUpdateLayoutQueued = true;
    queueMicrotask(() => {
      this.isUpdateLayoutQueued = false;
      this.updateLayout();
    });
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
   * Makes a leaf active, stamps its {@link WorkspaceLeaf.activeTime}, shows it in its tab group, and asks for the
   * `active-leaf-change` and `file-open` events through {@link Workspace.requestActiveLeafEvents}.
   *
   * As in Obsidian, a leaf that is already active is left alone and fires nothing, and the events are DEFERRED rather
   * than fired from this call — `requestActiveLeafEvents.run()` delivers a pending one at once. Unlike Obsidian, which
   * ignores a leaf outside the layout, a leaf outside the layout is first added to the root tab group, so a leaf built
   * with `WorkspaceLeaf.create2__(app)` can be made active without being placed by hand.
   *
   * @param leaf - The new active leaf.
   * @param _options - Whether to focus the leaf; ignored by the mock.
   */
  public setActiveLeaf(leaf: WorkspaceLeaf, _options?: WorkspaceSetActiveLeafOptions): void {
    if (!this.isAttached(leaf)) {
      getParent(leaf)?.removeChild(leaf);
      this.getRootTabGroup().insertChild(-1, leaf);
    }

    if (this.activeLeaf === leaf) {
      return;
    }

    this.activeLeaf = leaf;
    const parent = getParent(leaf);
    this.activeTabGroup = parent instanceof WorkspaceTabs ? parent : null;
    // Obsidian stamps `Date.now()`; kept strictly increasing so two activations in the same millisecond still order.
    this.lastActiveTime = Math.max(Date.now(), this.lastActiveTime + 1);
    leaf.activeTime = this.lastActiveTime;
    this.activeTabGroup?.selectTabIndex(this.activeTabGroup.children.indexOf(leaf));
    this.requestActiveLeafEvents();
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
   * Places an item in its own tab group beside another, as Obsidian does: next to the existing item's tab group when
   * the nearest split already runs in `direction`, and otherwise inside a new split of that direction that takes the
   * tab group's place. The share of the split is divided between the two, or carried onto the new split.
   *
   * An item outside the layout has nothing to split — Obsidian throws there; the mock adds the new item to the root
   * tab group instead.
   *
   * @param item - The item to split.
   * @param newItem - The item to place beside it.
   * @param direction - Whether to split vertically (side by side) or horizontally (stacked); `'vertical'` by default.
   * @param before - Whether to place the new item before the existing one.
   */
  public splitLeaf(item: WorkspaceItem, newItem: WorkspaceItem, direction: SplitDirectionOriginal = 'vertical', before = false): void {
    let child: WorkspaceItem = item;
    let ancestor = getParent(item);
    while (ancestor && !(ancestor instanceof WorkspaceSplit)) {
      child = ancestor;
      ancestor = getParent(ancestor);
    }

    if (!ancestor) {
      this.getRootTabGroup().insertChild(-1, newItem);
      return;
    }

    const tabs = WorkspaceTabs.create2__(this);
    tabs.insertChild(0, newItem);
    const index = ancestor.children.indexOf(child);
    const share = child.dimension;

    if (direction === ancestor.direction) {
      if (share !== null) {
        child.setDimension(share / SPLIT_DIMENSION_SHARE);
        tabs.setDimension(share / SPLIT_DIMENSION_SHARE);
      }
      ancestor.insertChild(before ? index : index + 1, tabs);
      return;
    }

    child.setDimension(null);
    const split = WorkspaceSplit.create2__(this, direction);
    // eslint-disable-next-line unicorn/prefer-modern-dom-apis -- `WorkspaceParent.replaceChild` is Obsidian's layout method, not the DOM's; the autofix would rewrite it into a DOM `replaceWith` call.
    ancestor.replaceChild(index, split);
    split.setDimension(share);
    split.insertChild(0, before ? tabs : child);
    split.insertChild(1, before ? child : tabs);
  }

  /**
   * Brings the layout back into a consistent state after it changed, as Obsidian does, and fires the events that go
   * with it. {@link Workspace.onLayoutChange} asks for it on a microtask; calling it directly does the work at once.
   *
   * It re-creates a tab group and a leaf in an emptied root split; picks a new active leaf when there is none or the
   * one there is has been detached, preferring the active tab group's current tab, then the most recently active leaf
   * of the focused container, then the most recently active leaf anywhere, and finally a new one; clears a link group
   * that is down to a single leaf; and ends by requesting a layout save and the `layout-change` event.
   *
   * As in Obsidian, it does nothing at all until the layout is ready.
   */
  public updateLayout(): void {
    if (!this.layoutReady) {
      return;
    }

    if (this.rootSplit.children.length === 0) {
      const tabs = WorkspaceTabs.create2__(this);
      tabs.setStacked(this.lastTabGroupStacked);
      tabs.insertChild(0, WorkspaceLeaf.create2__(this.app));
      this.rootSplit.insertChild(0, tabs);
    }

    const activeLeaf = this.activeLeaf;
    if (activeLeaf && this.isAttached(activeLeaf)) {
      const parent = getParent(activeLeaf);
      this.activeTabGroup = parent instanceof WorkspaceTabs ? parent : null;
    } else {
      this.setActiveLeaf(this.pickActiveLeaf(), { focus: true });
    }

    this.clearSingleMemberGroups();
    this.requestSaveLayout();
    this.requestLayoutChangeEvents();
  }

  /**
   * Reconfigures the options of every Markdown view. A no-op in the mock.
   */
  public updateOptions(): void {
    noop();
  }

  private clearSingleMemberGroups(): void {
    const counts = new Map<string, number>();
    this.iterateAllLeaves((leaf) => {
      const group = leaf.getGroup__();
      if (group !== null) {
        counts.set(group, (counts.get(group) ?? 0) + 1);
      }
    });

    for (const [group, count] of counts) {
      if (count !== 1) {
        continue;
      }
      for (const leaf of this.getGroupLeaves(group)) {
        leaf.setGroup(null);
      }
    }
  }

  private createLeafBesideMostRecent(container: WorkspaceParent): WorkspaceLeaf {
    const mostRecent = this.getMostRecentLeaf(container.asOriginalType3__());
    // A leaf the layout walk found always has a parent, so only the no-leaf case needs the container itself.
    const parent = mostRecent ? ensureNonNullable(getParent(mostRecent)) : container;
    const leaf = WorkspaceLeaf.create2__(this.app);
    parent.insertChild(-1, leaf);
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

  private findSelectedNavigableLeaf(container: WorkspaceParent): null | WorkspaceLeaf {
    let candidate: null | WorkspaceLeaf = null;
    this.iterateLeaves(container, (leaf) => {
      const parent = getParent(leaf);
      const isSelected = parent instanceof WorkspaceTabs && (parent.children[parent.currentTab] === leaf || parent.isStacked);
      if (leaf.canNavigate() && isSelected && (!candidate || candidate.activeTime < leaf.activeTime)) {
        candidate = leaf;
      }
    });
    return candidate;
  }

  private getMostRecentTabGroup(): WorkspaceParent {
    const mostRecentLeaf = this.getMostRecentLeaf();
    // A leaf the layout walk found always has a parent, so only the no-leaf case needs a fallback.
    return mostRecentLeaf ? ensureNonNullable(getParent(mostRecentLeaf)) : this.getRootTabGroup();
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

  private layoutChangeEvents(): void {
    if (this.layoutReady) {
      this.trigger('layout-change');
    }
  }

  private pickActiveLeaf(): WorkspaceLeaf {
    const group = this.activeTabGroup;
    if (group && this.isAttached(group)) {
      const current = group.children.at(group.currentTab);
      if (current instanceof WorkspaceLeaf) {
        return current;
      }
    }

    // `updateLayout` has just made sure the root split holds a leaf, and the mock's focused container is always the
    // root split, so Obsidian's two further fallbacks — the most recently active leaf anywhere, then a leaf created
    // in the root split — are unreachable here and are left out rather than shipped dead.
    return ensureNonNullable(this.getMostRecentLeaf(this.getFocusedContainer().asOriginalType3__()));
  }
}

function getParent(item: WorkspaceItem): null | WorkspaceParent {
  return isParentPlaceholder(item.parent) ? null : WorkspaceParent.fromOriginalType3__(item.parent);
}

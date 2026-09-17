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

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { Events } from './Events.ts';
import { debounce } from './functions/debounce.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';
import { WorkspaceRibbon } from './WorkspaceRibbon.ts';
import { WorkspaceRoot } from './WorkspaceRoot.ts';
import { WorkspaceSidedock } from './WorkspaceSidedock.ts';
import { WorkspaceWindow } from './WorkspaceWindow.ts';

// The `newLeaf` values that ask `getLeaf` for a NEW leaf rather than the active one.
const NEW_LEAF_REQUESTS = new Set<boolean | PaneTypeOriginal>(['split', 'tab', true, 'window']);

/**
 * Mock of Obsidian's `Workspace`.
 *
 * There is no layout tree: every leaf lives in one flat in-memory list, whatever split, sidebar or window it was
 * requested for. Methods that create a leaf append a new `WorkspaceLeaf` to that list, lookups filter it, and the
 * layout-ready state is driven by the test through {@link Workspace.setLayoutReady__}.
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

  private layoutReadyCallbacks: (() => unknown)[] = [];
  private leaves: WorkspaceLeaf[] = [];
  /**
   * Creates the workspace with its ribbons, sidebars and root split, and no leaves.
   *
   * @param app - The app the workspace belongs to.
   * @param containerEl - The workspace's root element.
   */
  protected constructor(app: App, containerEl: HTMLElement) {
    super();
    this.app = app;
    this.containerEl = containerEl;
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
   * Splits a leaf, creating a new leaf beside it. The mock just adds a new leaf to its list.
   *
   * @param _leaf - The leaf to split.
   * @param _direction - Whether to split vertically or horizontally.
   * @param _before - Whether to place the new leaf before the existing one.
   * @returns The new leaf.
   */
  public createLeafBySplit(_leaf: WorkspaceLeaf, _direction?: SplitDirectionOriginal, _before?: boolean): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Creates a leaf at an index inside a parent split. The mock just adds a new leaf to its list.
   *
   * @param _parent - The split to create the leaf in.
   * @param _index - The position within the parent.
   * @returns The new leaf.
   */
  public createLeafInParent(_parent: WorkspaceParentOriginal, _index: number): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Detaches every leaf whose view state has the given type, and drops them from the list.
   *
   * @param viewType - The view type to remove.
   */
  public detachLeavesOfType(viewType: string): void {
    const toDetach = this.leaves.filter((leaf) => leaf.getViewState().type === viewType);
    for (const leaf of toDetach) {
      leaf.detach();
    }
    this.leaves = this.leaves.filter((leaf) => leaf.getViewState().type !== viewType);
  }

  /**
   * Duplicates a leaf into a new tab, split or window. The mock adds a new, empty leaf to its list.
   *
   * @param _leaf - The leaf to duplicate.
   * @param _leafType - Where to open the duplicate.
   * @param _direction - The split direction, when splitting.
   * @returns The new leaf.
   */
  public async duplicateLeaf(_leaf: WorkspaceLeaf, _leafType?: boolean | PaneTypeOriginal, _direction?: SplitDirectionOriginal): Promise<WorkspaceLeaf> {
    await noopAsync();
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Gets a sidebar leaf of the given type, creating one if none exists. The mock always adds a new leaf to its list,
   * without setting its view type.
   *
   * @param _type - The view type.
   * @param _side - Which sidebar.
   * @param _options - Whether to activate, split or reveal the leaf, and the state to give it.
   * @returns The leaf.
   */
  public async ensureSideLeaf(
    _type: string,
    _side: SideOriginal,
    _options?: WorkspaceEnsureSideLeafOptions
  ): Promise<WorkspaceLeaf> {
    await noopAsync();
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
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
   * Gets the active view when it is an instance of the given class.
   *
   * @typeParam T - The view class.
   * @param _type - The view constructor to match.
   * @returns The matching view; always `null` in the mock.
   */
  public getActiveViewOfType<T extends ViewOriginal>(_type: ConstructorOriginal<T>): null | T {
    return null;
  }

  /**
   * Gets all leaves that belong to a linked group.
   *
   * @param group - The group id.
   * @returns The leaves whose group is `group`.
   */
  public getGroupLeaves(group: string): WorkspaceLeaf[] {
    return this.leaves.filter((leaf) => leaf.getGroup__() === group);
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
   * Gets a leaf to open something in. `'tab'`, `'split'`, `'window'` or `true` creates a new leaf; `false` or omitted
   * returns the active leaf, creating one and making it active when there is none.
   *
   * @param newLeaf - Whether, and where, to create a new leaf.
   * @returns The leaf.
   */
  public getLeaf(newLeaf?: boolean | PaneTypeOriginal): WorkspaceLeaf {
    if (newLeaf !== undefined && NEW_LEAF_REQUESTS.has(newLeaf)) {
      const leaf = WorkspaceLeaf.create2__(this.app);
      this.leaves.push(leaf);
      return leaf;
    }

    if (this.activeLeaf) {
      return this.activeLeaf;
    }

    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  /**
   * Gets a leaf by its id.
   *
   * @param id - The leaf id.
   * @returns The leaf, or `null` when no tracked leaf has that id.
   */
  public getLeafById(id: string): null | WorkspaceLeaf {
    return this.leaves.find((leaf) => leaf.id__ === id) ?? null;
  }

  /**
   * Gets every leaf whose view state has the given type.
   *
   * @param viewType - The view type.
   * @returns The matching leaves.
   */
  public getLeavesOfType(viewType: string): WorkspaceLeaf[] {
    return this.leaves.filter((leaf) => leaf.getViewState().type === viewType);
  }

  /**
   * Creates a leaf in the left sidebar. The mock just adds a new leaf to its list.
   *
   * @param _split - Whether to split the existing sidebar leaf.
   * @returns The new leaf; never `null` in the mock.
   */
  public getLeftLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Gets the most recently active leaf in a workspace root. The mock returns the last leaf added to its list.
   *
   * @param _root - The root to search; ignored by the mock.
   * @returns The leaf, or `null` when there are no leaves.
   */
  public getMostRecentLeaf(_root?: WorkspaceParentOriginal): null | WorkspaceLeaf {
    return this.leaves.length === 0 ? null : ensureNonNullable(this.leaves.at(-1));
  }

  /**
   * Creates a leaf in the right sidebar. The mock just adds a new leaf to its list.
   *
   * @param _split - Whether to split the existing sidebar leaf.
   * @returns The new leaf; never `null` in the mock.
   */
  public getRightLeaf(_split: boolean): null | WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Gets a leaf that is not pinned, creating one when every leaf is pinned. Obsidian deprecates it in favor of
   * `getLeaf(false)`.
   *
   * @returns The first unpinned leaf, or a new one.
   */
  public getUnpinnedLeaf(): WorkspaceLeaf {
    const unpinned = this.leaves.find((leaf) => !leaf.isPinned__());
    if (unpinned) {
      return unpinned;
    }
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
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
   * Calls the callback on every leaf: main area, floating and sidebar alike.
   *
   * @param callback - Called with each leaf.
   */
  public iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this.leaves) {
      callback(leaf);
    }
  }

  /**
   * Calls the callback on every leaf in the main area. The mock has no areas, so it visits every leaf.
   *
   * @param callback - Called with each leaf.
   */
  public iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => unknown): void {
    for (const leaf of this.leaves) {
      callback(leaf);
    }
  }

  /**
   * Moves a leaf into a new popout window. The mock tracks the leaf if it is not already tracked and returns a new
   * window; it never throws for a missing popout capability.
   *
   * @param leaf - The leaf to move.
   * @param _data - The window's initial size and position.
   * @returns The new window.
   */
  public moveLeafToPopout(leaf: WorkspaceLeaf, _data?: WorkspaceWindowInitDataOriginal): WorkspaceWindow {
    if (!this.leaves.includes(leaf)) {
      this.leaves.push(leaf);
    }
    return WorkspaceWindow.create3__(this);
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
   * Opens a popout window with a single new leaf. The mock just adds a new leaf to its list.
   *
   * @param _data - The window's initial size and position.
   * @returns The new leaf.
   */
  public openPopoutLeaf(_data?: WorkspaceWindowInitDataOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Mock-only: drops a leaf from the list, clearing {@link Workspace.activeLeaf} if it was active; called when a leaf
   * detaches.
   *
   * @param leaf - The leaf to remove.
   */
  public removeLeaf__(leaf: WorkspaceLeaf): void {
    this.leaves = this.leaves.filter((l) => l !== leaf);
    if (this.activeLeaf === leaf) {
      this.activeLeaf = null;
    }
  }

  /**
   * Brings a leaf to the foreground, expanding its sidebar if collapsed. The mock makes it the active leaf.
   *
   * @param leaf - The leaf to reveal.
   */
  public async revealLeaf(leaf: WorkspaceLeaf): Promise<void> {
    await noopAsync();
    this.setActiveLeaf(leaf);
  }

  /**
   * Makes a leaf active, tracking it if needed, and fires `active-leaf-change`.
   *
   * @param leaf - The new active leaf.
   * @param _options - Whether to focus the leaf; ignored by the mock.
   */
  public setActiveLeaf(leaf: WorkspaceLeaf, _options?: WorkspaceSetActiveLeafOptions): void {
    this.activeLeaf = leaf;
    if (!this.leaves.includes(leaf)) {
      this.leaves.push(leaf);
    }
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
   * Splits the active leaf. Obsidian deprecates it in favor of `getLeaf('split')`. The mock just adds a new leaf to
   * its list.
   *
   * @param _direction - Whether to split vertically or horizontally.
   * @returns The new leaf.
   */
  public splitActiveLeaf(_direction?: SplitDirectionOriginal): WorkspaceLeaf {
    const leaf = WorkspaceLeaf.create2__(this.app);
    this.leaves.push(leaf);
    return leaf;
  }

  /**
   * Reconfigures the options of every Markdown view. A no-op in the mock.
   */
  public updateOptions(): void {
    noop();
  }
}

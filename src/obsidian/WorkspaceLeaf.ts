/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceLeaf`, the layout node that hosts a single view.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  IconName as IconNameOriginal,
  OpenViewState as OpenViewStateOriginal,
  View as ViewOriginal,
  ViewState as ViewStateOriginal,
  WorkspaceLeaf as WorkspaceLeafOriginal,
  WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal,
  WorkspaceTabs as WorkspaceTabsOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import {
  createParentPlaceholder,
  EMPTY_VIEW_TYPE
} from '../internal/workspace-layout.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

// Held on an object so the counter can advance from inside the constructor without assigning to a module-level binding (`unicorn/no-top-level-assignment-in-function`).
const leafIdCounter = { next: 1 };

// Held the same way, for the id `setGroupMember` gives a leaf that is in no group yet.
const groupIdCounter = { next: 1 };

// Obsidian's group ids are 16 hexadecimal digits.
const GROUP_ID_LENGTH = 16;
const HEX_RADIX = 16;

/**
 * Mock of Obsidian's `WorkspaceLeaf`.
 *
 * Nothing is rendered: the leaf keeps its view, opened file, view state, ephemeral state, group and pinned flag in
 * memory so a test can read them back. It sits in the workspace's layout tree, and {@link WorkspaceLeaf.detach}
 * removes it from there.
 */
export class WorkspaceLeaf extends WorkspaceItem {
  /**
   * When the leaf was last made active, as a timestamp; `0` until then. `Workspace.setActiveLeaf` sets it, and
   * `Workspace.getMostRecentLeaf` picks the leaf with the highest value.
   */
  public activeTime = 0;

  /**
   * Mock-only: the app the leaf was created for, used to reach the mock workspace.
   */
  public readonly app__: App;

  /**
   * The hover popover currently shown for the leaf, or `null` when there is none.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * Mock-only: the leaf id, either the one given at construction or the next value of a module-wide counter.
   */
  public id__: string;

  /**
   * Whether the leaf is deferred because it is in the background, holding a placeholder instead of its real view.
   * Always `false` in the mock.
   */
  public readonly isDeferred = false;

  /**
   * The direct parent of the leaf: a `WorkspaceTabs` on desktop, possibly a `WorkspaceMobileDrawer` on mobile. A leaf
   * with no parent holds an empty strict proxy instead, which throws on any member access.
   */
  public override parent: WorkspaceMobileDrawerOriginal | WorkspaceTabsOriginal = createParentPlaceholder<WorkspaceMobileDrawerOriginal | WorkspaceTabsOriginal>();

  /**
   * The view shown in the leaf, or `null` until one is opened (Obsidian declares it non-null).
   */
  public view: null | ViewOriginal = null;

  /**
   * Mock-only: the file last opened with {@link WorkspaceLeaf.openFile}.
   *
   * @returns The opened file, or `null` when none was opened.
   */
  public get file__(): null | TFile {
    return this.file;
  }

  private ephemeralState: Record<string, unknown> = {};
  private file: null | TFile = null;
  private group: null | string = null;
  private pinned = false;

  private viewState: ViewStateOriginal = { type: '' };

  /**
   * Creates a leaf. Obsidian does not construct leaves publicly; use {@link WorkspaceLeaf.create2__}.
   *
   * @param app - The app the leaf belongs to.
   * @param id - The leaf id; a unique numeric id is generated when omitted.
   */
  protected constructor(app: App, id?: string) {
    super(app.workspace, id);
    this.app__ = app;
    this.id__ = id ?? String(leafIdCounter.next++);
    const self = strictProxy(this);
    self.constructor3__(app, id);
    return self;
  }

  /**
   * Mock-only factory: creates a leaf, spyable via `vi.spyOn(WorkspaceLeaf, 'create2__')`. The numbered subclass
   * variant of `create__`.
   *
   * @param app - The app the leaf belongs to.
   * @param id - The leaf id; a unique numeric id is generated when omitted.
   * @returns The new leaf.
   */
  public static create2__(app: App, id?: string): WorkspaceLeaf {
    return new WorkspaceLeaf(app, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceLeaf` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceLeaf`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: WorkspaceLeafOriginal): WorkspaceLeaf {
    return strictProxy(value, WorkspaceLeaf);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceLeaf` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceLeaf`.
   */
  public asOriginalType3__(): WorkspaceLeafOriginal {
    return strictProxy<WorkspaceLeafOriginal>(this);
  }

  /**
   * Whether the leaf may be navigated away from, which is what `Workspace.getUnpinnedLeaf` — and so `getLeaf(false)` —
   * uses to decide whether the leaf can be reused. As in Obsidian, that is its view's `navigation` flag and the leaf
   * not being pinned.
   *
   * A mock leaf holds no view where Obsidian holds its empty view, whose `navigation` is `true`, so a leaf with no
   * view navigates.
   *
   * @returns Whether the leaf can navigate.
   */
  public canNavigate(): boolean {
    return (this.view ? this.view.navigation : true) && !this.pinned;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceLeaf.prototype, 'constructor3__')`.
   *
   * @param _app - The app the leaf was created with.
   * @param _id - The leaf id the leaf was created with.
   */
  public constructor3__(_app: App, _id?: string): void {
    noop();
  }

  /**
   * Closes the leaf and removes it from the workspace's layout tree, through the mock workspace's `removeLeaf__`.
   */
  public override detach(): void {
    this.app__.workspace.removeLeaf__(this);
  }

  /**
   * Gets the text shown for the leaf, such as in its tab header.
   *
   * @returns The view's display text, or an empty string when no view is open.
   */
  public getDisplayText(): string {
    return this.view ? this.view.getDisplayText() : '';
  }

  /**
   * Gets the leaf's ephemeral state: transient view state, such as the scroll position, that is not saved in the
   * layout.
   *
   * @returns A shallow copy of the stored ephemeral state.
   */
  public getEphemeralState(): Record<string, unknown> {
    return { ...this.ephemeralState };
  }

  /**
   * Mock-only: reads the linked-view group set by {@link WorkspaceLeaf.setGroup} or
   * {@link WorkspaceLeaf.setGroupMember}.
   *
   * @returns The group name, or `null` when the leaf is in no group.
   */
  public getGroup__(): null | string {
    return this.group;
  }

  /**
   * Gets the icon shown for the leaf.
   *
   * @returns The view's icon, or an empty string when no view is open.
   */
  public getIcon(): IconNameOriginal {
    return this.view ? this.view.getIcon() : '';
  }

  /**
   * Gets the leaf's serializable view state: the view type and its state.
   *
   * @returns A shallow copy of the stored view state, `{ type: '' }` until one is set.
   */
  public getViewState(): ViewStateOriginal {
    return { ...this.viewState };
  }

  /**
   * Mock-only: the view type the leaf answers with, which is what `Workspace.getLeavesOfType` and
   * `Workspace.ensureSideLeaf` match on.
   *
   * Obsidian reads `leaf.view.getViewType()`, because `setViewState` builds the view. The mock's `setViewState`
   * stores the state without building one, so the open view's type wins when there is a view and the stored view
   * state's type stands in otherwise — falling back to `'empty'`, Obsidian's own answer for a leaf showing nothing.
   *
   * @returns The view type.
   */
  public getViewType__(): string {
    return this.view ? this.view.getViewType() : this.viewState.type || EMPTY_VIEW_TYPE;
  }

  /**
   * Mock-only: reads the pinned flag set by {@link WorkspaceLeaf.setPinned} or {@link WorkspaceLeaf.togglePinned}.
   *
   * @returns Whether the leaf is pinned.
   */
  public isPinned__(): boolean {
    return this.pinned;
  }

  /**
   * Mock-only: whether the leaf is showing Obsidian's empty view — the "New tab" page — which is what
   * `Workspace.createLeafInTabGroup` hands back instead of creating another tab.
   *
   * Obsidian asks `leaf.view instanceof EmptyView`, and can, because a leaf's view IS the empty view from
   * construction and goes back to it when the open view closes. A mock leaf holds `null` there, so the question is
   * put to the two things the mock does record: {@link WorkspaceLeaf.getViewType__} answers `'empty'` for a leaf
   * with no view and no view-state type — and for a view state whose type is literally `'empty'`, which is the
   * state Obsidian itself keeps the empty view for — while the file guard covers {@link WorkspaceLeaf.openFile},
   * which records the file without building a view where Obsidian would have replaced the empty view with a real
   * one.
   *
   * @returns Whether the leaf is showing the empty view.
   */
  public isShowingEmptyView__(): boolean {
    return this.getViewType__() === EMPTY_VIEW_TYPE && this.file === null;
  }

  /**
   * Loads the leaf's real view if it is deferred, resolving once it has fully loaded. The mock's leaves are never
   * deferred, so it resolves immediately.
   */
  public async loadIfDeferred(): Promise<void> {
    await noopAsync();
  }

  /**
   * Notifies the leaf that it was resized. The mock forwards the call to the view, if any.
   */
  public onResize(): void {
    if (this.view) {
      this.view.onResize();
    }
  }

  /**
   * Opens a view in the leaf. The mock stores it as {@link WorkspaceLeaf.view} without loading it.
   *
   * @param view - The view to open.
   * @returns The opened view.
   */
  public async open(view: ViewOriginal): Promise<ViewOriginal> {
    await noopAsync();
    this.view = view;
    return view;
  }

  /**
   * Opens a file in the leaf. The mock only records the file, readable through {@link WorkspaceLeaf.file__}; no view
   * is created and the open state is ignored.
   *
   * @param file - The file to open.
   * @param _openState - The view state to open the file with.
   */
  public async openFile(file: TFile, _openState?: OpenViewStateOriginal): Promise<void> {
    await noopAsync();
    this.file = file;
  }

  /**
   * Sets the leaf's ephemeral state. The mock stores a shallow copy.
   *
   * @param state - The new ephemeral state.
   */
  public setEphemeralState(state: Record<string, unknown>): void {
    this.ephemeralState = { ...state };
  }

  /**
   * Puts the leaf into a linked-view group, whose members follow each other's navigation. As in Obsidian, a change of
   * group first pins the leaf when it or any leaf already in the new group is pinned, then triggers `group-change`
   * with the new group; setting the group the leaf is already in does nothing.
   *
   * @param group - The group name, or `null` to leave any group.
   */
  public setGroup(group: null | string): void {
    if (group === this.group) {
      return;
    }

    const shouldPin = this.pinned || (group !== null && this.app__.workspace.getGroupLeaves(group).some((leaf) => leaf.isPinned__()));
    this.setPinned(shouldPin);
    this.group = group;
    this.trigger('group-change', group);
  }

  /**
   * Puts the leaf into the same linked-view group as another leaf. When that leaf is in no group yet, it is first put
   * into a new one, as Obsidian does. Passing the leaf itself does nothing, and passing `null` leaves any group.
   *
   * @param other - The leaf whose group to join, or `null`.
   */
  public setGroupMember(other: null | WorkspaceLeaf): void {
    if (other === this) {
      return;
    }

    let group: null | string = null;
    if (other) {
      group = other.getGroup__();
      if (group === null) {
        group = (groupIdCounter.next++).toString(HEX_RADIX).padStart(GROUP_ID_LENGTH, '0');
        other.setGroup(group);
      }
    }
    this.setGroup(group);
  }

  /**
   * Pins or unpins the leaf. As in Obsidian, it triggers `pinned-change` with the new flag, requests a layout save,
   * and pins or unpins every other leaf in the same group to match.
   *
   * @param pinned - Whether the leaf should be pinned.
   */
  public setPinned(pinned: boolean): void {
    this.pinned = pinned;
    this.trigger('pinned-change', pinned);
    this.app__.workspace.requestSaveLayout();

    if (this.group === null) {
      return;
    }

    for (const leaf of this.app__.workspace.getGroupLeaves(this.group)) {
      if (leaf.isPinned__() !== pinned) {
        leaf.setPinned(pinned);
      }
    }
  }

  /**
   * Sets the leaf's view state. The mock stores a shallow copy of it, and of the ephemeral state when given, then
   * triggers `view-state-change`; no view is created.
   *
   * @param viewState - The new view state.
   * @param eState - The ephemeral state to apply along with it.
   */
  // eslint-disable-next-line unicorn/name-replacements -- `eState` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public async setViewState(viewState: ViewStateOriginal, eState?: Record<string, unknown>): Promise<void> {
    await noopAsync();
    this.viewState = { ...viewState };
    if (eState) {
      this.ephemeralState = { ...eState };
    }
    this.trigger('view-state-change');
  }

  /**
   * Flips the leaf's pinned flag through {@link WorkspaceLeaf.setPinned}.
   */
  public togglePinned(): void {
    this.setPinned(!this.pinned);
  }
}

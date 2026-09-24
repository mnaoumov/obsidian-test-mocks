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

import type { ViewStateResultInternal } from '../internal/types.ts';
import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { EmptyView } from '../internal/empty-view.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { UnknownView } from '../internal/unknown-view.ts';
import {
  createParentPlaceholder,
  EMPTY_VIEW_TYPE
} from '../internal/workspace-layout.ts';
import { FileView } from './FileView.ts';
import { View } from './View.ts';
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
 * The leaf keeps its opened file, ephemeral state, group and pinned flag in memory so a test can read them back. It
 * sits in the workspace's layout tree, and {@link WorkspaceLeaf.detach} removes it from there.
 *
 * As in Obsidian its {@link WorkspaceLeaf.view} is REAL and never `null`: the leaf is born holding
 * {@link WorkspaceLeaf._empty}, the "New tab" page, and {@link WorkspaceLeaf.setViewState} builds the view its type
 * names through `App.viewRegistry`. So the view state is not stored — {@link WorkspaceLeaf.getViewState} derives it
 * from the view, exactly as the app does.
 */
export class WorkspaceLeaf extends WorkspaceItem {
  /**
   * The "New tab" page the leaf is born holding, and goes back to whenever {@link WorkspaceLeaf.open} is passed
   * `null`. Obsidian keeps it under this name too.
   */
  public _empty: EmptyView;

  /**
   * When the leaf was last made active, as a timestamp; `0` until then. `Workspace.setActiveLeaf` sets it, and
   * `Workspace.getMostRecentLeaf` picks the leaf with the highest value.
   */
  public activeTime = 0;

  /**
   * Mock-only: the app the leaf was created for, used to reach the mock workspace and the view registry.
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
   *
   * Always `false` in the mock. Obsidian defers a view only when the leaf has no history state, is not already
   * deferred, carries an icon and a title in its view state, and its element is off screen; the mock has neither a
   * history nor a rendered element, so that branch is unreachable and a registered type always goes through its
   * creator.
   */
  public readonly isDeferred = false;

  /**
   * The direct parent of the leaf: a `WorkspaceTabs` on desktop, possibly a `WorkspaceMobileDrawer` on mobile. A leaf
   * with no parent holds an empty strict proxy instead, which throws on any member access.
   */
  public override parent: WorkspaceMobileDrawerOriginal | WorkspaceTabsOriginal = createParentPlaceholder<WorkspaceMobileDrawerOriginal | WorkspaceTabsOriginal>();

  /**
   * The tab header's close button, the last child of the header's inner element. As in Obsidian it carries the
   * `lucide-x` icon and the `Close` tooltip; the mock records them as its `data-icon` and `aria-label` attributes, and
   * does not attach Obsidian's click listener, so clicking it does not detach the leaf.
   */
  public tabHeaderCloseEl: HTMLDivElement;

  /**
   * The leaf's tab header, a `workspace-tab-header tappable` div, built in the constructor exactly as Obsidian builds
   * it. It holds one `workspace-tab-header-inner` div, whose children are, in order,
   * {@link WorkspaceLeaf.tabHeaderInnerIconEl}, {@link WorkspaceLeaf.tabHeaderInnerTitleEl},
   * {@link WorkspaceLeaf.tabHeaderStatusContainerEl} and {@link WorkspaceLeaf.tabHeaderCloseEl}.
   *
   * The mock builds the element but not the rest of the header: it is not placed in a tab group's header container,
   * Obsidian's drag, context-menu and middle-click listeners are not attached, and `updateHeader` — which fills the
   * icon and title and creates the pinned and linked status icons — is not modelled, so both inner elements stay
   * empty.
   */
  public tabHeaderEl: HTMLElement;

  /**
   * The tab header's icon element, a `workspace-tab-header-inner-icon` div inside {@link WorkspaceLeaf.tabHeaderEl}.
   * Empty in the mock, which does not model `updateHeader`.
   */
  public tabHeaderInnerIconEl: HTMLElement;

  /**
   * The tab header's title element, a `workspace-tab-header-inner-title` div inside {@link WorkspaceLeaf.tabHeaderEl}.
   * Empty in the mock, which does not model `updateHeader`.
   */
  public tabHeaderInnerTitleEl: HTMLElement;

  /**
   * The container for the tab header's status icons, a `workspace-tab-header-status-container` div inside
   * {@link WorkspaceLeaf.tabHeaderEl}, between the title and the close button. Obsidian puts the pinned and linked
   * icons here, and plugins append their own indicators to it, which a test can read back.
   */
  public tabHeaderStatusContainerEl: HTMLDivElement;

  /**
   * The view shown in the leaf. Never `null`: a leaf showing nothing holds {@link WorkspaceLeaf._empty}.
   */
  public view: ViewOriginal;

  /**
   * Mock-only: the file the leaf's view has loaded.
   *
   * @returns The file view's file, or `null` when the view is not a file view or has none.
   */
  public get file__(): null | TFile {
    return this.view instanceof FileView ? this.view.file : null;
  }

  private ephemeralState: Record<string, unknown> = {};
  private group: null | string = null;
  private pinned = false;

  // Obsidian's own guard: a `setViewState` reached from inside another one is dropped.
  private working = false;

  /**
   * Creates a leaf showing the empty view. Obsidian does not construct leaves publicly; use
   * {@link WorkspaceLeaf.create2__}.
   *
   * @param app - The app the leaf belongs to.
   * @param id - The leaf id; a unique numeric id is generated when omitted.
   */
  protected constructor(app: App, id?: string) {
    super(app.workspace, id);
    this.app__ = app;
    this.id__ = id ?? String(leafIdCounter.next++);
    this._empty = EmptyView.create2__(this);
    this.view = this._empty.asOriginalType2__();
    this.containerEl.append(this._empty.containerEl);

    // Obsidian's own construction of the tab header, element for element.
    this.tabHeaderEl = createDiv('workspace-tab-header tappable');
    this.tabHeaderEl.draggable = true;
    const tabHeaderInnerEl = this.tabHeaderEl.createDiv('workspace-tab-header-inner');
    this.tabHeaderInnerIconEl = tabHeaderInnerEl.createDiv('workspace-tab-header-inner-icon');
    this.tabHeaderInnerTitleEl = tabHeaderInnerEl.createDiv('workspace-tab-header-inner-title');
    this.tabHeaderStatusContainerEl = tabHeaderInnerEl.createDiv('workspace-tab-header-status-container');
    this.tabHeaderCloseEl = tabHeaderInnerEl.createDiv('workspace-tab-header-inner-close-button');
    this.tabHeaderCloseEl.dataset['icon'] = 'lucide-x';
    this.tabHeaderCloseEl.setAttribute('aria-label', 'Close');

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
   * not being pinned; the empty view navigates, so a leaf showing nothing is reusable.
   *
   * @returns Whether the leaf can navigate.
   */
  public canNavigate(): boolean {
    return this.view.navigation && !this.pinned;
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
   * @returns The view's display text.
   */
  public getDisplayText(): string {
    return this.view.getDisplayText();
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
   * @returns The view's icon.
   */
  public getIcon(): IconNameOriginal {
    return this.view.getIcon();
  }

  /**
   * Gets the leaf's serializable view state, derived from the view as Obsidian derives it: its type and state, plus
   * the pinned flag when the leaf is pinned.
   *
   * Obsidian also writes the view's icon and display text into the result, for the placeholder it shows while a
   * deferred view loads. Neither `obsidian.d.ts` nor `obsidian-typings` declares those two members of `ViewState`,
   * and the mock never defers, so it leaves them out.
   *
   * @returns The view state.
   */
  public getViewState(): ViewStateOriginal {
    return {
      ...this.pinned && { pinned: true },
      state: this.view.getState(),
      type: this.view.getViewType()
    };
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
   * Loads the leaf's real view if it is deferred, resolving once it has fully loaded. The mock's leaves are never
   * deferred, so it resolves immediately.
   */
  public async loadIfDeferred(): Promise<void> {
    await noopAsync();
  }

  /**
   * Notifies the leaf that it was resized. The mock forwards the call to the view.
   */
  public onResize(): void {
    this.view.onResize();
  }

  /**
   * Shows a view in the leaf, replacing whatever it was showing. As in Obsidian the outgoing view is closed first —
   * its element detached and its component unloaded — and a failure to close is logged rather than thrown; `null`
   * puts {@link WorkspaceLeaf._empty} back.
   *
   * The user-facing notice Obsidian shows when a view fails to close is not modeled.
   *
   * @param view - The view to show, or `null` for the empty view.
   * @returns The view the leaf ended up showing.
   */
  public async open(view: null | ViewOriginal): Promise<ViewOriginal> {
    const current = this.view;
    if (view === current) {
      return current;
    }

    try {
      const closing = View.fromOriginalType2__(current).close();
      // Obsidian does not await the empty view's close, because it is put back rather than discarded.
      if (!(current instanceof EmptyView)) {
        await closing;
      }
    } catch (error) {
      console.error('Failed to close view', error);
    }

    const next = view ?? this._empty.asOriginalType2__();
    this.view = next;
    try {
      await View.fromOriginalType2__(next).open(this.containerEl);
    } catch (error) {
      console.error('Failed to open view', error);
    }
    return next;
  }

  /**
   * Opens a file in the leaf, as Obsidian does: the view type registered for the file's extension, or the current
   * view's own type when it already accepts that extension, and then {@link WorkspaceLeaf.setViewState} with the
   * file's path in the state.
   *
   * A file whose extension no view type is registered for changes nothing, which is Obsidian's own branch for one —
   * the notice and the open-with-default-app fallback it takes there are not modeled. Only the Markdown view is
   * registered by default, so that is what a `.md` file opens in.
   *
   * @param file - The file to open.
   * @param openState - The state, ephemeral state, active flag and link group to open the file with.
   */
  public async openFile(file: TFile, openState?: OpenViewStateOriginal): Promise<void> {
    const options = openState ?? {};
    const view = this.view;
    const type = view instanceof FileView && view.canAcceptExtension(file.extension)
      ? view.getViewType()
      : this.app__.viewRegistry.getTypeByExtension(file.extension);
    if (type === undefined) {
      return;
    }

    const viewState: ViewStateOriginal = {
      ...options.group && { group: options.group },
      active: options.active ?? this === this.app__.workspace.activeLeaf,
      state: {
        ...options.state,
        file: file.path
      },
      type
    };

    await this.setViewState(viewState, options.eState);
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
   * Shows a view of the given type in the leaf, building it through `App.viewRegistry`, exactly as Obsidian does.
   *
   * - **The view is only rebuilt when the type CHANGES.** A state naming the type the leaf already shows keeps the
   * view and only calls `setState` on it.
   * - A registered type goes through its creator; a creator that throws is logged and falls back to the unknown-type
   * view, which keeps the type it could not build.
   * - An unregistered type gives the unknown-type view, except for `'empty'`, which gives
   * {@link WorkspaceLeaf._empty} back — Obsidian's own answer for it.
   * - A view that answers `close` on the result — a file view left with no file — sends the leaf back to the empty
   * view; one that answers `layout` asks the workspace to update the layout.
   * - `active` activates the leaf, `group` joins that leaf's link group, and the ephemeral state is applied last.
   * - A call reached from inside another one is dropped, through Obsidian's own `working` guard.
   *
   * Obsidian also records navigation history around all of this; the mock has no history, so it does not.
   *
   * @param viewState - The new view state.
   * @param eState - The ephemeral state to apply along with it.
   */
  // eslint-disable-next-line unicorn/name-replacements -- `eState` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public async setViewState(viewState: ViewStateOriginal, eState?: Record<string, unknown>): Promise<void> {
    if (this.working) {
      return;
    }
    this.working = true;

    try {
      let view = this.view;
      const result: ViewStateResultInternal = {
        close: false,
        history: false,
        layout: false
      };

      if (viewState.type !== view.getViewType()) {
        view = await this.open(this.buildView(viewState.type));
        result.history = true;
        result.layout = true;
      }

      try {
        await view.setState(viewState.state ?? {}, result);
      } catch (error) {
        console.error(error);
      }

      if (result.close) {
        await this.open(null);
      }

      if (viewState.active) {
        this.app__.workspace.setActiveLeaf(this, { focus: true });
      }

      if (viewState.group !== undefined) {
        this.setGroupMember(WorkspaceLeaf.fromOriginalType3__(viewState.group));
      }

      if (eState) {
        this.setEphemeralState(eState);
      }

      if (result.layout) {
        this.app__.workspace.onLayoutChange();
      }

      result.done?.();
    } finally {
      this.working = false;
    }
  }

  /**
   * Flips the leaf's pinned flag through {@link WorkspaceLeaf.setPinned}.
   */
  public togglePinned(): void {
    this.setPinned(!this.pinned);
  }

  private buildView(type: string): ViewOriginal {
    const viewCreator = this.app__.viewRegistry.getViewCreatorByType(type);
    if (viewCreator) {
      try {
        return viewCreator(this.asOriginalType3__());
      } catch (error) {
        console.error(`Failed to create view of type "${type}"`, error);
        return UnknownView.create3__(this, type).asOriginalType2__();
      }
    }

    return type === EMPTY_VIEW_TYPE ? this._empty.asOriginalType2__() : UnknownView.create3__(this, type).asOriginalType2__();
  }
}

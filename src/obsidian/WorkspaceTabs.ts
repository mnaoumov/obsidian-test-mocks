/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceTabs`, the tab group that holds leaves.
 */

import type {
  WorkspaceSplit as WorkspaceSplitOriginal,
  WorkspaceTabs as WorkspaceTabsOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';
import type { WorkspaceItem } from './WorkspaceItem.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { createParentPlaceholder } from '../internal/workspace-layout.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceTabs`, a tab group whose children are leaves.
 *
 * The mock tracks the leaves, which of them is the current tab, and whether the group is stacked. Nothing is
 * rendered, so the tab headers, their widths and the scrolling that go with them are absent.
 */
export class WorkspaceTabs extends WorkspaceParent {
  /**
   * Whether the tab group may keep a single child; always `true`, as in Obsidian.
   */
  public override allowSingleChild = true;

  /**
   * The index in {@link WorkspaceTabs.children} of the tab currently shown. `Workspace.setActiveLeaf` moves it, and
   * `Workspace.getUnpinnedLeaf` reuses only a leaf that is its group's current tab.
   */
  public currentTab = 0;

  /**
   * Whether the group shows its tabs stacked rather than as a single visible tab. `false` unless
   * {@link WorkspaceTabs.setStacked} sets it.
   */
  public isStacked = false;

  /**
   * The split the tab group sits in. A tab group with no parent holds an empty strict proxy instead, which throws on
   * any member access.
   */
  public override parent: WorkspaceSplitOriginal = createParentPlaceholder<WorkspaceSplitOriginal>();

  /**
   * Creates a tab group. Obsidian does not construct it publicly; use {@link WorkspaceTabs.create2__}.
   *
   * @param workspace - The workspace the tab group belongs to.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxy(this);
    self.constructor4__(workspace, id);
    return self;
  }

  /**
   * Mock-only factory: creates a tab group, spyable via `vi.spyOn(WorkspaceTabs, 'create2__')`. The numbered
   * subclass variant of `create__`.
   *
   * @param workspace - The workspace the tab group belongs to.
   * @param id - The item id.
   * @returns The new tab group.
   */
  public static create2__(workspace: Workspace, id?: string): WorkspaceTabs {
    return new WorkspaceTabs(workspace, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceTabs` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceTabs`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: WorkspaceTabsOriginal): WorkspaceTabs {
    return strictProxy(value, WorkspaceTabs);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceTabs` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceTabs`.
   */
  public asOriginalType4__(): WorkspaceTabsOriginal {
    return strictProxy<WorkspaceTabsOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceTabs.prototype, 'constructor4__')`.
   *
   * @param _workspace - The workspace the tab group was created with.
   * @param _id - The item id the tab group was created with.
   */
  public constructor4__(_workspace: Workspace, _id?: string): void {
    noop();
  }

  /**
   * Removes a child, keeping {@link WorkspaceTabs.currentTab} on the same leaf when another one went, and moving it to
   * the nearest remaining tab when the current one did — as Obsidian does. Removing the last child records whether the
   * group was stacked, so the group the workspace re-creates in an emptied root split matches it.
   *
   * @param child - The child to remove.
   */
  public override removeChild(child: WorkspaceItem): void {
    const removedIndex = this.children.indexOf(child);
    const previousIndex = this.currentTab;
    const previousCurrent = this.children.at(previousIndex);

    if (this.children.length === 1) {
      this.requireWorkspace().lastTabGroupStacked = this.isStacked;
    }

    super.removeChild(child);

    if (this.children.length > 0 && removedIndex === previousIndex) {
      this.currentTab = Math.min(removedIndex, this.children.length - 1);
      this.requireWorkspace().onLayoutChange(this);
      return;
    }

    // A group whose current tab was already out of range answers -1 too, which is what Obsidian's
    // `children.indexOf(undefined)` gives it.
    this.currentTab = previousCurrent === undefined ? -1 : this.children.indexOf(previousCurrent);
  }

  /**
   * Shows a child of the group, by identity.
   *
   * @param tab - The child to show; one that is not a child of this group is ignored.
   */
  public selectTab(tab: WorkspaceItem): void {
    const index = this.children.indexOf(tab);
    if (index !== -1) {
      this.selectTabIndex(index);
    }
  }

  /**
   * Shows the tab at an index, clamped to the group's range. As in Obsidian, selecting the tab that is already current
   * does nothing.
   *
   * @param index - The index to show.
   */
  public selectTabIndex(index: number): void {
    const clamped = Math.min(Math.max(index, 0), this.children.length - 1);
    if (this.currentTab === clamped) {
      return;
    }

    this.currentTab = clamped;
    this.requireWorkspace().requestSaveLayout();
  }

  /**
   * Stacks or unstacks the group. As in Obsidian, a group that holds children asks the workspace to update the layout.
   *
   * @param stacked - Whether the group should be stacked.
   */
  public setStacked(stacked: boolean): void {
    if (this.isStacked === stacked) {
      return;
    }

    this.isStacked = stacked;
    if (this.children.length > 0) {
      this.requireWorkspace().requestUpdateLayout();
    }
  }

  // A tab group is always created with a workspace, so this never throws; it only narrows the base class's optional
  // field, which exists for the items a test builds on their own.
  private requireWorkspace(): Workspace {
    return ensureNonNullable(this.layoutWorkspace);
  }
}

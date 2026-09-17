/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceParent`, the abstract base of workspace items that contain other items.
 */

import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { isParentPlaceholder } from '../internal/workspace-layout.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

/**
 * Mock of Obsidian's `WorkspaceParent`, the base of splits, tabs, drawers and the other container nodes of the
 * layout tree.
 *
 * The children are tracked in memory and adopted and released the way Obsidian does it. Nothing is rendered, and child
 * dimensions are not kept.
 */
export abstract class WorkspaceParent extends WorkspaceItem {
  /**
   * Whether the parent may keep a single child. When it may not, removing its second-to-last child replaces it in its
   * own parent with the child that is left. `false` by default, as for a plain split.
   */
  public allowSingleChild = false;

  /**
   * The child items, in layout order.
   */
  public children: WorkspaceItem[] = [];

  /**
   * Creates a parent item.
   *
   * @param workspace - The workspace the item belongs to.
   * @param id - The item id.
   */
  protected constructor(workspace?: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxy(this);
    self.constructor3__(workspace, id);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceParent` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceParent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: WorkspaceParentOriginal): WorkspaceParent {
    return strictProxy(value, WorkspaceParent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceParent` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceParent`.
   */
  public asOriginalType3__(): WorkspaceParentOriginal {
    return strictProxy<WorkspaceParentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceParent.prototype, 'constructor3__')`.
   *
   * @param _workspace - The workspace the item was created with.
   * @param _id - The item id the item was created with.
   */
  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  /**
   * Inserts a child at an index and makes this item its parent.
   *
   * @param index - The position to insert at; a negative or out-of-range index appends.
   * @param child - The child to insert.
   */
  public insertChild(index: number, child: WorkspaceItem): void {
    const position = index < 0 || index >= this.children.length ? this.children.length : index;
    this.children.splice(position, 0, child);
    child.setParent(this.asOriginalType3__());
  }

  /**
   * Removes a child and leaves it without a parent. As in Obsidian, a parent left empty then removes itself from its
   * own parent, and one left with a single child it may not keep is replaced there by that child.
   *
   * @param child - The child to remove.
   */
  public removeChild(child: WorkspaceItem): void {
    removeFrom(this.children, child);
    child.setParent(null);

    if (isParentPlaceholder(this.parent)) {
      return;
    }

    const parent = WorkspaceParent.fromOriginalType3__(this.parent);
    if (this.children.length === 0) {
      parent.removeChild(this);
      return;
    }

    if (this.children.length !== 1 || this.allowSingleChild) {
      return;
    }

    const onlyChild = ensureNonNullable(this.children.at(0));
    removeFrom(this.children, onlyChild);
    onlyChild.setParent(null);
    parent.replaceChild(parent.children.indexOf(this), onlyChild);
  }

  /**
   * Replaces the child at an index, leaving the old child without a parent and making this item the new child's
   * parent.
   *
   * @param index - The position of the child to replace; it is clamped to the children's range.
   * @param child - The new child.
   */
  public replaceChild(index: number, child: WorkspaceItem): void {
    const position = Math.min(Math.max(index, 0), this.children.length);
    const oldChild = this.children[position];
    oldChild?.setParent(null);
    this.children[position] = child;
    child.setParent(this.asOriginalType3__());
  }
}

function removeFrom(children: WorkspaceItem[], child: WorkspaceItem): void {
  const index = children.indexOf(child);
  if (index !== -1) {
    children.splice(index, 1);
  }
}

/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceItem`, the abstract base of every node in the workspace layout tree.
 */

import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal,
  WorkspaceParent as WorkspaceParentOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/castTo.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import {
  createParentPlaceholder,
  isContainer,
  isParentPlaceholder
} from '../internal/workspace-layout.ts';
import { Events } from './Events.ts';

/**
 * The part of `WorkspaceParent` an item calls on its parent, named structurally because importing the class here
 * would be an import cycle.
 */
interface LayoutParent {
  removeChild(child: WorkspaceItem): void;
}

// Obsidian stores a flex-grow outside the open range `(0, 100)` as `null`.
const MAX_DIMENSION = 100;

/**
 * Mock of Obsidian's `WorkspaceItem`, the base of leaves, splits, tabs and the other layout nodes.
 *
 * Items form a real layout tree through {@link WorkspaceItem.parent} and `WorkspaceParent.children`, so
 * {@link WorkspaceItem.getRoot} and {@link WorkspaceItem.getContainer} walk up it the way Obsidian does.
 */
export abstract class WorkspaceItem extends Events {
  /**
   * The item's own element.
   *
   * The mock does NOT build the layout's DOM tree: each item gets a detached element of its own, so a child's
   * element is not inside its parent's, and the layout is read through {@link WorkspaceItem.parent} and
   * `WorkspaceParent.children` instead. The one containment it does maintain is a leaf's view — `WorkspaceLeaf.open`
   * appends the view's element here and detaches it again when the view closes.
   */
  public containerEl: HTMLElement = createDiv();

  /**
   * The item's share of its parent split, as a flex-grow value, or `null` when it takes its natural share. The
   * workspace sets it when it creates, splits or promotes an item; nothing is rendered from it.
   */
  public dimension: null | number = null;

  /**
   * The direct parent of the item. An item with no parent holds an empty strict proxy instead, which throws on any
   * member access; {@link WorkspaceItem.setParent} and `WorkspaceParent.insertChild` replace it.
   */
  public parent: WorkspaceParentOriginal = createParentPlaceholder<WorkspaceParentOriginal>();

  /**
   * The workspace the item belongs to, which subclasses reach for `onLayoutChange` and the layout requests. It is
   * optional because a test can build a bare item with no workspace at all; every item the workspace itself creates
   * has one.
   */
  protected readonly layoutWorkspace: undefined | Workspace;

  /**
   * Creates a workspace item.
   *
   * @param workspace - The workspace the item belongs to; {@link WorkspaceItem.getContainer} falls back to its root
   * split.
   * @param id - The item id.
   */
  protected constructor(workspace?: Workspace, id?: string) {
    super();
    this.layoutWorkspace = workspace;
    const self = strictProxy(this);
    self.constructor2__(workspace, id);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceItem` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceItem`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: WorkspaceItemOriginal): WorkspaceItem {
    return strictProxy(value, WorkspaceItem);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceItem` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceItem`.
   */
  public asOriginalType2__(): WorkspaceItemOriginal {
    return strictProxy<WorkspaceItemOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceItem.prototype, 'constructor2__')`.
   *
   * @param _workspace - The workspace the item was created with.
   * @param _id - The item id the item was created with.
   */
  public constructor2__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  /**
   * Removes the item from its parent, if it has one.
   */
  public detach(): void {
    if (this.hasParent()) {
      castTo<LayoutParent>(this.parent).removeChild(this);
    }
  }

  /**
   * Gets the root container the item lives in: the nearest `WorkspaceContainer` among the item and its ancestors,
   * falling back to the workspace's root split when there is none, as Obsidian does.
   *
   * @returns The container.
   * @throws An `Error` when the item has no container ancestor and was created without a workspace.
   */
  public getContainer(): WorkspaceContainerOriginal {
    const container = this.findContainer();
    if (container) {
      return container;
    }

    if (!this.layoutWorkspace) {
      throw new Error('The workspace item has no container ancestor and belongs to no workspace.');
    }
    return this.layoutWorkspace.rootSplit.asOriginalType5__();
  }

  /**
   * Gets the root item of the layout tree the item belongs to, by walking up through its parents.
   *
   * @returns The topmost ancestor, or the item itself when it has no parent.
   */
  public getRoot(): WorkspaceItem {
    return this.hasParent() ? castTo<WorkspaceItem>(this.parent).getRoot() : this;
  }

  /**
   * Sets the item's share of its parent split. As in Obsidian, a value outside the open range `(0, 100)` is stored as
   * `null`; the mock renders nothing, so it only keeps the value.
   *
   * @param dimension - The flex-grow value, or `null` to take the natural share.
   */
  public setDimension(dimension: null | number): void {
    this.dimension = dimension !== null && (dimension <= 0 || dimension >= MAX_DIMENSION) ? null : dimension;
  }

  /**
   * Sets the item's parent. `WorkspaceParent` calls it when it adopts or releases a child.
   *
   * @param parent - The new parent, or `null` to leave the item without one.
   */
  public setParent(parent: null | WorkspaceParentOriginal): void {
    this.parent = parent ?? createParentPlaceholder<WorkspaceParentOriginal>();
  }

  private findContainer(): null | WorkspaceContainerOriginal {
    if (isContainer(this)) {
      return castTo<WorkspaceContainerOriginal>(this);
    }
    return this.hasParent() ? castTo<WorkspaceItem>(this.parent).findContainer() : null;
  }

  private hasParent(): boolean {
    return !isParentPlaceholder(this.parent);
  }
}

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

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';

/**
 * Mock of Obsidian's `WorkspaceItem`, the base of leaves, splits, tabs and the other layout nodes.
 *
 * The mock keeps no real layout tree: {@link WorkspaceItem.getRoot} and {@link WorkspaceItem.getContainer} both
 * answer with the item itself.
 */
export abstract class WorkspaceItem extends Events {
  /**
   * The direct parent of the item. Starts as an empty strict proxy, which throws on any member access until a test
   * assigns a real parent.
   */
  public parent: WorkspaceParentOriginal = strictProxy<WorkspaceParentOriginal>({});

  /**
   * Creates a workspace item.
   *
   * @param workspace - The workspace the item belongs to.
   * @param id - The item id.
   */
  protected constructor(workspace?: Workspace, id?: string) {
    super();
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
   * Gets the root container the item lives in: the `WorkspaceRoot` or a popout `WorkspaceWindow`. The mock returns
   * the item itself, typed as a container.
   *
   * @returns The item itself, typed as a `WorkspaceContainer`.
   */
  public getContainer(): WorkspaceContainerOriginal {
    return strictProxy<WorkspaceContainerOriginal>(this);
  }

  /**
   * Gets the root item of the layout tree the item belongs to. The mock returns the item itself.
   *
   * @returns The item itself.
   */
  public getRoot(): this {
    return this;
  }
}

/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceParent`, the abstract base of workspace items that contain other items.
 */

import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

/**
 * Mock of Obsidian's `WorkspaceParent`, the base of splits, tabs, drawers and the other container nodes of the
 * layout tree. The mock tracks no children.
 */
export abstract class WorkspaceParent extends WorkspaceItem {
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
}

/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceFloating`, the workspace item that holds the popout windows.
 */

import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceFloating`, the parent of every popout `WorkspaceWindow`. The workspace keeps one as
 * its `floatingSplit`.
 */
export class WorkspaceFloating extends WorkspaceParent {
  /**
   * Whether the floating item may keep a single child; always `true`, as in Obsidian.
   */
  public override allowSingleChild = true;

  /**
   * Creates the floating item. Obsidian does not construct it publicly; use {@link WorkspaceFloating.create2__}.
   *
   * @param workspace - The workspace the floating item belongs to.
   */
  protected constructor(workspace?: Workspace) {
    super(workspace);
    const self = strictProxy(this);
    self.constructor4__(workspace);
    return self;
  }

  /**
   * Mock-only factory: creates a floating item, spyable via `vi.spyOn(WorkspaceFloating, 'create2__')`. The
   * numbered subclass variant of `create__`.
   *
   * @param workspace - The workspace the floating item belongs to.
   * @returns The new floating item.
   */
  public static create2__(workspace?: Workspace): WorkspaceFloating {
    return new WorkspaceFloating(workspace);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceFloating` as this mock. The numbered subclass variant
   * of `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceFloating`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: WorkspaceFloatingOriginal): WorkspaceFloating {
    return strictProxy(value, WorkspaceFloating);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceFloating` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceFloating`.
   */
  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return strictProxy<WorkspaceFloatingOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceFloating.prototype, 'constructor4__')`.
   *
   * @param _workspace - The workspace the floating item was created with.
   */
  public constructor4__(_workspace?: Workspace): void {
    noop();
  }
}

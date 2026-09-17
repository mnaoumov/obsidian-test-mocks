/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceFloating`, the workspace item that holds the popout windows.
 */

import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceFloating`, the parent of every popout `WorkspaceWindow`.
 */
export class WorkspaceFloating extends WorkspaceParent {
  /**
   * Creates the floating item. Obsidian does not construct it publicly; use {@link WorkspaceFloating.create2__}.
   */
  protected constructor() {
    super();
    const self = strictProxy(this);
    self.constructor4__();
    return self;
  }

  /**
   * Mock-only factory: creates a floating item, spyable via `vi.spyOn(WorkspaceFloating, 'create2__')`. The
   * numbered subclass variant of `create__`.
   *
   * @returns The new floating item.
   */
  public static create2__(): WorkspaceFloating {
    return new WorkspaceFloating();
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
   */
  public constructor4__(): void {
    noop();
  }
}

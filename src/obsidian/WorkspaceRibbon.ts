/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceRibbon`, the vertical icon strip beside a side dock.
 */

import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `WorkspaceRibbon`. Obsidian's public API declares no members on it, and the mock implements
 * none beyond the mock-only bridges.
 */
export class WorkspaceRibbon {
  /**
   * Creates a ribbon. Obsidian does not construct it publicly; use {@link WorkspaceRibbon.create__}.
   *
   * @param workspace - The workspace the ribbon belongs to.
   * @param side - The side of the window the ribbon is on.
   */
  protected constructor(workspace: Workspace, side: string) {
    const self = strictProxy(this);
    self.constructor__(workspace, side);
    return self;
  }

  /**
   * Mock-only factory: creates a ribbon, spyable via `vi.spyOn(WorkspaceRibbon, 'create__')`.
   *
   * @param workspace - The workspace the ribbon belongs to.
   * @param side - The side of the window the ribbon is on.
   * @returns The new ribbon.
   */
  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(workspace, side);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceRibbon` as this mock.
   *
   * @param value - The value typed as the original `WorkspaceRibbon`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: WorkspaceRibbonOriginal): WorkspaceRibbon {
    return strictProxy(value, WorkspaceRibbon);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceRibbon` type.
   *
   * @returns The same object, typed as the original `WorkspaceRibbon`.
   */
  public asOriginalType__(): WorkspaceRibbonOriginal {
    return strictProxy<WorkspaceRibbonOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceRibbon.prototype, 'constructor__')`.
   *
   * @param _workspace - The workspace the ribbon was created with.
   * @param _side - The side the ribbon was created with.
   */
  public constructor__(_workspace: Workspace, _side: string): void {
    noop();
  }
}

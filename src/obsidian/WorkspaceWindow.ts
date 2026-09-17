/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceWindow`, the container of a popout window.
 */

import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';

/**
 * Mock of Obsidian's `WorkspaceWindow`, the root split of a popout window. No window is opened: the mock is bound
 * to the global `window` and `document`, the same as `WorkspaceRoot`, and lays its children out vertically as
 * Obsidian's does. The requested size is not kept: Obsidian stores it on a `size` member that neither `obsidian.d.ts`
 * nor `obsidian-typings` declares, so the mock has no member to keep it under.
 */
export class WorkspaceWindow extends WorkspaceContainer {
  /**
   * The document of the popout window. The mock has no separate window.
   *
   * @returns The global `document`.
   */
  public override get doc(): Document {
    return document;
  }

  /**
   * The popout window. The mock has no separate window.
   *
   * @returns The global `window`.
   */
  public override get win(): Window {
    return window;
  }

  /**
   * Creates a popout container. Obsidian does not construct it publicly; use {@link WorkspaceWindow.create3__}.
   *
   * @param workspace - The workspace the window belongs to.
   * @param id - The item id.
   * @param size - The requested window size, which the mock does not keep.
   */
  protected constructor(workspace: Workspace, id?: string, size?: Record<string, number>) {
    super(workspace, 'vertical', id);
    const self = strictProxy(this);
    self.constructor6__(workspace, id, size);
    return self;
  }

  /**
   * Mock-only factory: creates a popout container, spyable via `vi.spyOn(WorkspaceWindow, 'create3__')`. The
   * numbered subclass variant of `create__`.
   *
   * @param workspace - The workspace the window belongs to.
   * @param id - The item id.
   * @param size - The requested window size.
   * @returns The new popout container.
   */
  public static create3__(workspace: Workspace, id?: string, size?: Record<string, number>): WorkspaceWindow {
    return new WorkspaceWindow(workspace, id, size);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceWindow` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceWindow`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType6__(value: WorkspaceWindowOriginal): WorkspaceWindow {
    return strictProxy(value, WorkspaceWindow);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceWindow` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceWindow`.
   */
  public asOriginalType6__(): WorkspaceWindowOriginal {
    return strictProxy<WorkspaceWindowOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceWindow.prototype, 'constructor6__')`.
   *
   * @param _workspace - The workspace the window was created with.
   * @param _id - The item id the window was created with.
   * @param _size - The window size the window was created with.
   */
  public constructor6__(_workspace: Workspace, _id?: string, _size?: Record<string, number>): void {
    noop();
  }
}

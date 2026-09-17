/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceRoot`, the container of the main window's editing area.
 */

import type {
  SplitDirection as SplitDirectionOriginal,
  WorkspaceRoot as WorkspaceRootOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';

/**
 * Mock of Obsidian's `WorkspaceRoot`, the root split of the main window, bound to the global `window` and
 * `document`.
 */
export class WorkspaceRoot extends WorkspaceContainer {
  /**
   * The document of the main window.
   *
   * @returns The global `document`.
   */
  public override get doc(): Document {
    return document;
  }

  /**
   * The main window.
   *
   * @returns The global `window`.
   */
  public override get win(): Window {
    return window;
  }

  /**
   * Creates the root split. Obsidian does not construct it publicly; use {@link WorkspaceRoot.create3__}.
   *
   * @param workspace - The workspace the root belongs to.
   * @param direction - The split direction.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, direction: SplitDirectionOriginal, id?: string) {
    super(workspace, direction, id);
    const self = strictProxy(this);
    self.constructor6__(workspace, direction, id);
    return self;
  }

  /**
   * Mock-only factory: creates a root split, spyable via `vi.spyOn(WorkspaceRoot, 'create3__')`. The numbered
   * subclass variant of `create__`.
   *
   * @param workspace - The workspace the root belongs to.
   * @param direction - The split direction.
   * @param id - The item id.
   * @returns The new root split.
   */
  public static create3__(workspace: Workspace, direction: SplitDirectionOriginal, id?: string): WorkspaceRoot {
    return new WorkspaceRoot(workspace, direction, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceRoot` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceRoot`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType6__(value: WorkspaceRootOriginal): WorkspaceRoot {
    return strictProxy(value, WorkspaceRoot);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceRoot` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceRoot`.
   */
  public asOriginalType6__(): WorkspaceRootOriginal {
    return strictProxy<WorkspaceRootOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceRoot.prototype, 'constructor6__')`.
   *
   * @param _workspace - The workspace the root was created with.
   * @param _direction - The split direction the root was created with.
   * @param _id - The item id the root was created with.
   */
  public constructor6__(_workspace: Workspace, _direction: SplitDirectionOriginal, _id?: string): void {
    noop();
  }
}

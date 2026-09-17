/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceContainer`, the abstract top-level split that owns a window and its document.
 */

import type {
  SplitDirection as SplitDirectionOriginal,
  WorkspaceContainer as WorkspaceContainerOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { markContainer } from '../internal/workspace-layout.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

/**
 * Mock of Obsidian's `WorkspaceContainer`: the root split of a workspace window, implemented by
 * `WorkspaceRoot` (the main window) and `WorkspaceWindow` (a popout window).
 */
export abstract class WorkspaceContainer extends WorkspaceSplit {
  /**
   * Whether the container may keep a single child; always `true` for a container, as in Obsidian.
   */
  public override allowSingleChild = true;

  /**
   * The document the container's elements live in.
   */
  public abstract doc: Document;

  /**
   * The window the container is displayed in.
   */
  public abstract win: Window;

  /**
   * Creates a container split.
   *
   * @param workspace - The workspace the container belongs to.
   * @param direction - The split direction.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, direction: SplitDirectionOriginal, id?: string) {
    super(workspace, direction, id);
    markContainer(this);
    const self = strictProxy(this);
    self.constructor5__(workspace, direction, id);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceContainer` as this mock. The numbered subclass variant
   * of `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceContainer`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: WorkspaceContainerOriginal): WorkspaceContainer {
    return strictProxy(value, WorkspaceContainer);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceContainer` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceContainer`.
   */
  public asOriginalType5__(): WorkspaceContainerOriginal {
    return strictProxy<WorkspaceContainerOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceContainer.prototype, 'constructor5__')`.
   *
   * @param _workspace - The workspace the container was created with.
   * @param _direction - The split direction the container was created with.
   * @param _id - The item id the container was created with.
   */
  public constructor5__(_workspace: Workspace, _direction: SplitDirectionOriginal, _id?: string): void {
    noop();
  }
}

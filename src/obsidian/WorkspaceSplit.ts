/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceSplit`, the layout node that arranges its children side by side.
 */

import type {
  SplitDirection as SplitDirectionOriginal,
  WorkspaceSplit as WorkspaceSplitOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceSplit`, which lays its children out vertically or horizontally. The mock keeps the
 * direction and the children, but renders nothing and tracks no sizes.
 */
export class WorkspaceSplit extends WorkspaceParent {
  /**
   * The direction the children are laid out in: `'vertical'` places them side by side, `'horizontal'` stacks them.
   */
  public direction: SplitDirectionOriginal;

  /**
   * Creates a split. Obsidian does not construct it publicly; use {@link WorkspaceSplit.create2__}.
   *
   * @param workspace - The workspace the split belongs to.
   * @param direction - The split direction.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, direction: SplitDirectionOriginal, id?: string) {
    super(workspace, id);
    this.direction = direction;
    const self = strictProxy(this);
    self.constructor4__(workspace, direction, id);
    return self;
  }

  /**
   * Mock-only factory: creates a split, spyable via `vi.spyOn(WorkspaceSplit, 'create2__')`. The numbered subclass
   * variant of `create__`.
   *
   * @param workspace - The workspace the split belongs to.
   * @param direction - The split direction.
   * @param id - The item id.
   * @returns The new split.
   */
  public static create2__(workspace: Workspace, direction: SplitDirectionOriginal, id?: string): WorkspaceSplit {
    return new WorkspaceSplit(workspace, direction, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceSplit` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceSplit`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: WorkspaceSplitOriginal): WorkspaceSplit {
    return strictProxy(value, WorkspaceSplit);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceSplit` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceSplit`.
   */
  public asOriginalType4__(): WorkspaceSplitOriginal {
    return strictProxy<WorkspaceSplitOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceSplit.prototype, 'constructor4__')`.
   *
   * @param _workspace - The workspace the split was created with.
   * @param _direction - The split direction the split was created with.
   * @param _id - The item id the split was created with.
   */
  public constructor4__(_workspace: Workspace, _direction: SplitDirectionOriginal, _id?: string): void {
    noop();
  }

  /**
   * Sets the direction the children are laid out in.
   *
   * @param direction - The new direction.
   */
  public setDirection(direction: SplitDirectionOriginal): void {
    this.direction = direction;
  }
}

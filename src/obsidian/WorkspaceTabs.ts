/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceTabs`, the tab group that holds leaves.
 */

import type {
  WorkspaceSplit as WorkspaceSplitOriginal,
  WorkspaceTabs as WorkspaceTabsOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { createParentPlaceholder } from '../internal/workspace-layout.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceTabs`, a tab group whose children are leaves. The mock tracks the leaves but no current
 * tab.
 */
export class WorkspaceTabs extends WorkspaceParent {
  /**
   * Whether the tab group may keep a single child; always `true`, as in Obsidian.
   */
  public override allowSingleChild = true;

  /**
   * The split the tab group sits in. A tab group with no parent holds an empty strict proxy instead, which throws on
   * any member access.
   */
  public override parent: WorkspaceSplitOriginal = createParentPlaceholder<WorkspaceSplitOriginal>();

  /**
   * Creates a tab group. Obsidian does not construct it publicly; use {@link WorkspaceTabs.create2__}.
   *
   * @param workspace - The workspace the tab group belongs to.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxy(this);
    self.constructor4__(workspace, id);
    return self;
  }

  /**
   * Mock-only factory: creates a tab group, spyable via `vi.spyOn(WorkspaceTabs, 'create2__')`. The numbered
   * subclass variant of `create__`.
   *
   * @param workspace - The workspace the tab group belongs to.
   * @param id - The item id.
   * @returns The new tab group.
   */
  public static create2__(workspace: Workspace, id?: string): WorkspaceTabs {
    return new WorkspaceTabs(workspace, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceTabs` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceTabs`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: WorkspaceTabsOriginal): WorkspaceTabs {
    return strictProxy(value, WorkspaceTabs);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceTabs` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceTabs`.
   */
  public asOriginalType4__(): WorkspaceTabsOriginal {
    return strictProxy<WorkspaceTabsOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceTabs.prototype, 'constructor4__')`.
   *
   * @param _workspace - The workspace the tab group was created with.
   * @param _id - The item id the tab group was created with.
   */
  public constructor4__(_workspace: Workspace, _id?: string): void {
    noop();
  }
}

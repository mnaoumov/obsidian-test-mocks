import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super(_workspace, _id);
    const self = createMockOfUnsafe(this);
    self.constructor4__(_workspace, _direction, _id);
    return self;
  }

  public static create2__(workspace: Workspace, direction: string, id?: string): WorkspaceSplit {
    return new WorkspaceSplit(workspace, direction, id);
  }

  public static fromOriginalType4__(value: WorkspaceSplitOriginal): WorkspaceSplit {
    return createMockOfUnsafe<WorkspaceSplit>(value);
  }

  public asOriginalType4__(): WorkspaceSplitOriginal {
    return createMockOfUnsafe<WorkspaceSplitOriginal>(this);
  }

  public constructor4__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

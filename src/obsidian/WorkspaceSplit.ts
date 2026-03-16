import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  protected constructor(workspace: Workspace, direction: string, id?: string) {
    super(workspace, id);
    const self = strictProxy(this);
    self.constructor4__(workspace, direction, id);
    return self;
  }

  public static create2__(workspace: Workspace, direction: string, id?: string): WorkspaceSplit {
    return new WorkspaceSplit(workspace, direction, id);
  }

  public static fromOriginalType4__(value: WorkspaceSplitOriginal): WorkspaceSplit {
    return strictProxy(value, WorkspaceSplit);
  }

  public asOriginalType4__(): WorkspaceSplitOriginal {
    return strictProxy<WorkspaceSplitOriginal>(this);
  }

  public constructor4__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super(_workspace, _id);
    const self = strictMock(this);
    self.constructor4__(_workspace, _direction, _id);
    return self;
  }

  public static create2__(workspace: Workspace, direction: string, id?: string): WorkspaceSplit {
    return new WorkspaceSplit(workspace, direction, id);
  }

  public static fromOriginalType4__(value: WorkspaceSplitOriginal): WorkspaceSplit {
    return castTo<WorkspaceSplit>(value);
  }

  public asOriginalType4__(): WorkspaceSplitOriginal {
    return castTo<WorkspaceSplitOriginal>(this);
  }

  public constructor4__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

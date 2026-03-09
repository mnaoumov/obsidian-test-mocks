import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super();
  }

  public static create__(workspace: Workspace, direction: string, id?: string): WorkspaceSplit {
    return strictMock(new WorkspaceSplit(workspace, direction, id));
  }

  public override asOriginalType__(): WorkspaceSplitOriginal {
    return castTo<WorkspaceSplitOriginal>(this);
  }
}

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

  public static create__(_workspace: Workspace, _direction: string, _id?: string): WorkspaceSplit {
    return strictMock(new WorkspaceSplit(_workspace, _direction, _id));
  }

  public override asOriginalType__(): WorkspaceSplitOriginal {
    return castTo<WorkspaceSplitOriginal>(this);
  }
}

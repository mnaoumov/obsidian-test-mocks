import type { WorkspaceSplit as WorkspaceSplitOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super();
    const mock = strictMock(this);
    WorkspaceSplit.constructor__(mock, _workspace, _direction, _id);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceSplit, _workspace: Workspace, _direction: string, _id?: string): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _direction: string, _id?: string): WorkspaceSplit {
    return new WorkspaceSplit(_workspace, _direction, _id);
  }

  public override asOriginalType__(): WorkspaceSplitOriginal {
    return castTo<WorkspaceSplitOriginal>(this);
  }
}

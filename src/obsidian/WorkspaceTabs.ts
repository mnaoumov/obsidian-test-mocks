import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';
import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  declare public parent: WorkspaceSplit;

  protected constructor(_workspace: Workspace, _id?: string) {
    super();
  }

  public static create__(_workspace: Workspace, _id?: string): WorkspaceTabs {
    return strictMock(new WorkspaceTabs(_workspace, _id));
  }

  public override asOriginalType__(): WorkspaceTabsOriginal {
    return castTo<WorkspaceTabsOriginal>(this);
  }
}

import type { WorkspaceTabs as RealWorkspaceTabs } from 'obsidian';

import type { Workspace } from './Workspace.ts';
import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  declare public parent: WorkspaceSplit;

  protected constructor(_workspace: Workspace, _id?: string) {
    super();
    const mock = strictMock(this);
    WorkspaceTabs.constructor__(mock, _workspace, _id);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceTabs, _workspace: Workspace, _id?: string): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _id?: string): WorkspaceTabs {
    return new WorkspaceTabs(_workspace, _id);
  }

  public override asReal__(): RealWorkspaceTabs {
    return strictCastTo<RealWorkspaceTabs>(this);
  }
}

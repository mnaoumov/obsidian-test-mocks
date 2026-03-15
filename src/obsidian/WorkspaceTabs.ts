import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';
import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  declare public parent: WorkspaceSplit;

  protected constructor(_workspace: Workspace, _id?: string) {
    super(_workspace, _id);
    const self = strictMock(this);
    self.constructor4__(_workspace, _id);
    return self;
  }

  public static create2__(workspace: Workspace, id?: string): WorkspaceTabs {
    return new WorkspaceTabs(workspace, id);
  }

  public static fromOriginalType4__(value: WorkspaceTabsOriginal): WorkspaceTabs {
    return castTo<WorkspaceTabs>(value);
  }

  public asOriginalType4__(): WorkspaceTabsOriginal {
    return castTo<WorkspaceTabsOriginal>(this);
  }

  public constructor4__(_workspace: Workspace, _id?: string): void {
    noop();
  }
}

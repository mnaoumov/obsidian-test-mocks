import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor(workspace?: Workspace, id?: string) {
    super(workspace, id);
    const self = strictMock(this);
    self.constructor3__(workspace, id);
    return self;
  }

  public override asOriginalType__(): WorkspaceParentOriginal {
    return castTo<WorkspaceParentOriginal>(this);
  }

  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }
}

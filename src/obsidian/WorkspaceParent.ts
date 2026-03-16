import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
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

  public static fromOriginalType3__(value: WorkspaceParentOriginal): WorkspaceParent {
    return createMockOfUnsafe<WorkspaceParent>(value);
  }

  public asOriginalType3__(): WorkspaceParentOriginal {
    return createMockOfUnsafe<WorkspaceParentOriginal>(this);
  }

  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }
}

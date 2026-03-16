import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor(workspace?: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxyForce(this);
    self.constructor3__(workspace, id);
    return self;
  }

  public static fromOriginalType3__(value: WorkspaceParentOriginal): WorkspaceParent {
    return strictProxyForce(value, WorkspaceParent);
  }

  public asOriginalType3__(): WorkspaceParentOriginal {
    return strictProxyForce<WorkspaceParentOriginal>(this);
  }

  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }
}

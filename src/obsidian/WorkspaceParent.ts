import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor(workspace?: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxyForce(this);
    self.constructor3__(workspace, id);
    return self;
  }

  public static fromOriginalType3__(value: WorkspaceParentOriginal): WorkspaceParent {
    return mergePrototype(WorkspaceParent, value);
  }

  public asOriginalType3__(): WorkspaceParentOriginal {
    return strictProxyForce<WorkspaceParentOriginal>(this);
  }

  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }
}

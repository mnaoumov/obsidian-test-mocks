import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor(workspace?: Workspace, id?: string) {
    super(workspace, id);
    const self = strictProxy(this);
    self.constructor3__(workspace, id);
    return self;
  }

  public static fromOriginalType3__(value: WorkspaceParentOriginal): WorkspaceParent {
    return bridgeType<WorkspaceParent>(value);
  }

  public asOriginalType3__(): WorkspaceParentOriginal {
    return bridgeType<WorkspaceParentOriginal>(this);
  }

  public constructor3__(_workspace?: Workspace, _id?: string): void {
    noop();
  }
}

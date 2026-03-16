import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';

export class WorkspaceRibbon {
  protected constructor(_workspace: Workspace, _side: string) {
    const self = strictProxyForce(this);
    self.constructor__(_workspace, _side);
    return self;
  }

  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(workspace, side);
  }

  public static fromOriginalType__(value: WorkspaceRibbonOriginal): WorkspaceRibbon {
    return strictProxyForce(value, WorkspaceRibbon);
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return strictProxyForce<WorkspaceRibbonOriginal>(this);
  }

  public constructor__(_workspace: Workspace, _side: string): void {
    noop();
  }
}

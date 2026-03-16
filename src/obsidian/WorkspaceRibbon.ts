import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class WorkspaceRibbon {
  protected constructor(workspace: Workspace, side: string) {
    const self = strictProxy(this);
    self.constructor__(workspace, side);
    return self;
  }

  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(workspace, side);
  }

  public static fromOriginalType__(value: WorkspaceRibbonOriginal): WorkspaceRibbon {
    return strictProxy(value, WorkspaceRibbon);
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return strictProxy<WorkspaceRibbonOriginal>(this);
  }

  public constructor__(_workspace: Workspace, _side: string): void {
    noop();
  }
}

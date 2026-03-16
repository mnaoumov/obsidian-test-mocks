import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class WorkspaceRibbon {
  protected constructor(_workspace: Workspace, _side: string) {
    const self = createMockOfUnsafe(this);
    self.constructor__(_workspace, _side);
    return self;
  }

  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(workspace, side);
  }

  public static fromOriginalType__(value: WorkspaceRibbonOriginal): WorkspaceRibbon {
    return createMockOfUnsafe<WorkspaceRibbon>(value);
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return createMockOfUnsafe<WorkspaceRibbonOriginal>(this);
  }

  public constructor__(_workspace: Workspace, _side: string): void {
    noop();
  }
}

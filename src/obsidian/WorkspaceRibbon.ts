import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor(_workspace: Workspace, _side: string) {
    noop();
    const self = strictMock(this);
    self.constructor__(_workspace, _side);
    return self;
  }

  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(workspace, side);
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return castTo<WorkspaceRibbonOriginal>(this);
  }

  public constructor__(_workspace: Workspace, _side: string): void {
    noop();
  }
}

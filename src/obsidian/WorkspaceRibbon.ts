import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor(_workspace: Workspace, _side: string) {
    noop();
  }

  public static create__(workspace: Workspace, side: string): WorkspaceRibbon {
    return strictMock(new WorkspaceRibbon(workspace, side));
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return castTo<WorkspaceRibbonOriginal>(this);
  }
}

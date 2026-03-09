import type { WorkspaceRibbon as WorkspaceRibbonOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor(_workspace: Workspace, _side: string) {
  }

  public static create__(_workspace: Workspace, _side: string): WorkspaceRibbon {
    return strictMock(new WorkspaceRibbon(_workspace, _side));
  }

  public asOriginalType__(): WorkspaceRibbonOriginal {
    return castTo<WorkspaceRibbonOriginal>(this);
  }
}

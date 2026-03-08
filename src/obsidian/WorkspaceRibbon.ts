import type { Workspace } from './Workspace.ts';

import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor(_workspace: Workspace, _side: string) {
    const mock = strictMock(this);
    WorkspaceRibbon.constructor__(mock, _workspace, _side);
    return mock;
  }

  public static constructor__(_instance: WorkspaceRibbon, _workspace: Workspace, _side: string): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _side: string): WorkspaceRibbon {
    return new WorkspaceRibbon(_workspace, _side);
  }
}

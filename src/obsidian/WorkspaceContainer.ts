import type { Workspace } from './Workspace.ts';

import { WorkspaceSplit } from './WorkspaceSplit.ts';

export abstract class WorkspaceContainer extends WorkspaceSplit {
  public abstract doc: Document;
  public abstract win: Window;

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super(_workspace, _direction, _id);
    WorkspaceContainer.constructor__(this, _workspace, _direction, _id);
  }

  public static override constructor__(_instance: WorkspaceContainer, _workspace: Workspace, _direction: string, _id?: string): void {
    // Spy hook.
  }
}

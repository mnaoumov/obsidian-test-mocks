import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor() {
    super();
    WorkspaceParent.__constructor(this);
  }

  public static override __constructor(_instance: WorkspaceParent, ..._args: unknown[]): void {
    // Spy hook.
  }
}

import { WorkspaceSplit } from './WorkspaceSplit.ts';

export abstract class WorkspaceContainer extends WorkspaceSplit {
  public abstract doc: Document;
  public abstract win: Window;

  protected constructor() {
    super();
    WorkspaceContainer.constructor__(this);
  }

  public static override constructor__(_instance: WorkspaceContainer, ..._args: unknown[]): void {
    // Spy hook.
  }
}

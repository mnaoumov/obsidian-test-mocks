import { WorkspaceSplit } from './WorkspaceSplit.ts';

export abstract class WorkspaceContainer extends WorkspaceSplit {
  public abstract doc: Document;
  public abstract win: Window;

  protected constructor() {
    super();
    WorkspaceContainer.__constructor(this);
  }

  public static override __constructor(_instance: WorkspaceContainer, ..._args: unknown[]): void {
    // Spy hook.
  }
}

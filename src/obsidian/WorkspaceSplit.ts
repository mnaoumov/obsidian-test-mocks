import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  protected constructor() {
    super();
    WorkspaceSplit.__constructor(this);
  }

  public static __create(): WorkspaceSplit {
    return Reflect.construct(WorkspaceSplit, []) as WorkspaceSplit;
  }

  public static override __constructor(_instance: WorkspaceSplit, ..._args: unknown[]): void {
    // Spy hook.
  }
}

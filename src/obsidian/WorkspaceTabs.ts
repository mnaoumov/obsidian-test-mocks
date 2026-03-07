import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  protected constructor() {
    super();
    WorkspaceTabs.__constructor(this);
  }

  public static __create(): WorkspaceTabs {
    return Reflect.construct(WorkspaceTabs, []) as WorkspaceTabs;
  }

  public static override __constructor(_instance: WorkspaceTabs, ..._args: unknown[]): void {
    // Spy hook.
  }
}

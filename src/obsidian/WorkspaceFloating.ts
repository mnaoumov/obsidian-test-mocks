import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  protected constructor() {
    super();
    WorkspaceFloating.__constructor(this);
  }

  public static __create(): WorkspaceFloating {
    return Reflect.construct(WorkspaceFloating, []) as WorkspaceFloating;
  }

  public static override __constructor(_instance: WorkspaceFloating, ..._args: unknown[]): void {
    // Spy hook.
  }
}

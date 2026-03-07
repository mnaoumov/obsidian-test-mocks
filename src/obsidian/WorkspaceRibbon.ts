export class WorkspaceRibbon {
  protected constructor() {
    WorkspaceRibbon.__constructor(this);
  }

  public static __create(): WorkspaceRibbon {
    return Reflect.construct(WorkspaceRibbon, []) as WorkspaceRibbon;
  }

  public static __constructor(_instance: WorkspaceRibbon, ..._args: unknown[]): void {
    // Spy hook.
  }
}

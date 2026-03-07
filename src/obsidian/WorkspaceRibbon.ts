import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  protected constructor() {
    WorkspaceRibbon.__constructor(this);
    return strictMock(this);
  }

  public static __create(): WorkspaceRibbon {
    return Reflect.construct(WorkspaceRibbon as unknown as new () => WorkspaceRibbon, []) as WorkspaceRibbon;
  }

  public static __constructor(_instance: WorkspaceRibbon, ..._args: unknown[]): void {
    // Spy hook.
  }
}

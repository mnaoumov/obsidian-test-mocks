import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRibbon.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceRibbon {
    return Reflect.construct(WorkspaceRibbon as unknown as new () => WorkspaceRibbon, []) as WorkspaceRibbon;
  }

  public static __constructor(_instance: WorkspaceRibbon, ..._args: unknown[]): void {
    // Spy hook.
  }
}

import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRibbon.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceRibbon {
    return new WorkspaceRibbon();
  }

  public static __constructor(_instance: WorkspaceRibbon, ..._args: unknown[]): void {
    // Spy hook.
  }
}

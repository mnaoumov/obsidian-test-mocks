import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRibbon.constructor__(mock);
    return mock;
  }

  public static create__(): WorkspaceRibbon {
    return new WorkspaceRibbon();
  }

  public static constructor__(_instance: WorkspaceRibbon, ..._args: unknown[]): void {
    // Spy hook.
  }
}

import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRibbon {
  // Intentionally has no additional members, obsidian.d.ts doesn't have any members to mock.
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRibbon.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: WorkspaceRibbon): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _side?: string): WorkspaceRibbon {
    return new WorkspaceRibbon();
  }
}

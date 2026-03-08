import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceTabs.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceTabs {
    return new WorkspaceTabs();
  }

  public static override __constructor(_instance: WorkspaceTabs, ..._args: unknown[]): void {
    // Spy hook.
  }
}

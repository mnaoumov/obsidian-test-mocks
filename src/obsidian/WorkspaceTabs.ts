import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  protected constructor() {
    super();
    WorkspaceTabs.__constructor(this);
    return strictMock(this);
  }

  public static __create(): WorkspaceTabs {
    return Reflect.construct(WorkspaceTabs as unknown as new () => WorkspaceTabs, []) as WorkspaceTabs;
  }

  public static override __constructor(_instance: WorkspaceTabs, ..._args: unknown[]): void {
    // Spy hook.
  }
}

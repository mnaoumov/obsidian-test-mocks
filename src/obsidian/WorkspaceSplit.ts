import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceSplit.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceSplit {
    return Reflect.construct(WorkspaceSplit as unknown as new () => WorkspaceSplit, []) as WorkspaceSplit;
  }

  public static override __constructor(_instance: WorkspaceSplit, ..._args: unknown[]): void {
    // Spy hook.
  }
}

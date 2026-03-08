import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceFloating.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceFloating {
    return new WorkspaceFloating();
  }

  public static override __constructor(_instance: WorkspaceFloating, ..._args: unknown[]): void {
    // Spy hook.
  }
}

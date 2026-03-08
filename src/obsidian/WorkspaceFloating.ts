import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  public declare parent: WorkspaceParent;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceFloating.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceFloating, ..._args: unknown[]): void {
    // Spy hook.
  }

  public static create__(): WorkspaceFloating {
    return new WorkspaceFloating();
  }
}

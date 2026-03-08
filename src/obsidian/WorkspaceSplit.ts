import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceSplit extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceSplit.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceSplit): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _direction?: string, _id?: string): WorkspaceSplit {
    return new WorkspaceSplit();
  }
}

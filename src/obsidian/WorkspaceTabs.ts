import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  public declare parent: WorkspaceSplit;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceTabs.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceTabs, ..._args: unknown[]): void {
    // Spy hook.
  }

  public static create__(): WorkspaceTabs {
    return new WorkspaceTabs();
  }
}

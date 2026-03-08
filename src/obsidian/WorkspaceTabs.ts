import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  public declare parent: WorkspaceSplit;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceTabs.__constructor(mock);
    return mock;
  }

  public static override __constructor(_instance: WorkspaceTabs, ..._args: unknown[]): void {
    // Spy hook.
  }

  public static __create(): WorkspaceTabs {
    return new WorkspaceTabs();
  }
}

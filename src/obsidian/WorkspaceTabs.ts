import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  declare public parent: WorkspaceSplit;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceTabs.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceTabs): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _id?: string): WorkspaceTabs {
    return new WorkspaceTabs();
  }
}

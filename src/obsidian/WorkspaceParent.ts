import type { WorkspaceParent as RealWorkspaceParent } from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceParent.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceParent, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override asReal__(): RealWorkspaceParent {
    return strictCastTo<RealWorkspaceParent>(this);
  }
}

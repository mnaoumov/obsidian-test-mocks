import { castTo } from '../internal/Cast.ts';
import type { WorkspaceParent as RealWorkspaceParent } from 'obsidian';

import {
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
    return castTo<RealWorkspaceParent>(this);
  }
}

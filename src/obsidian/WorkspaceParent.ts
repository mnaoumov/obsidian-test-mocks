import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
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

  public override asOriginalType__(): WorkspaceParentOriginal {
    return castTo<WorkspaceParentOriginal>(this);
  }
}

import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

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

  public override asOriginalType__(): WorkspaceFloatingOriginal {
    return castTo<WorkspaceFloatingOriginal>(this);
  }
}

import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor() {
    super();
  }

  public static create__(): WorkspaceFloating {
    return strictMock(new WorkspaceFloating());
  }

  public override asOriginalType__(): WorkspaceFloatingOriginal {
    return castTo<WorkspaceFloatingOriginal>(this);
  }
}

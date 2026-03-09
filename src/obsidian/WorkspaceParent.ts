import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor() {
    super();
  }

  public override asOriginalType__(): WorkspaceParentOriginal {
    return castTo<WorkspaceParentOriginal>(this);
  }
}

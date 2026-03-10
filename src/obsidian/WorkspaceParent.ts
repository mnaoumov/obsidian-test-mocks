import type { WorkspaceParent as WorkspaceParentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceItem } from './WorkspaceItem.ts';

export abstract class WorkspaceParent extends WorkspaceItem {
  protected constructor() {
    super();
    const self = strictMock(this);
    self.constructor3__();
    return self;
  }

  public override asOriginalType__(): WorkspaceParentOriginal {
    return castTo<WorkspaceParentOriginal>(this);
  }

  public constructor3__(): void {
    noop();
  }
}

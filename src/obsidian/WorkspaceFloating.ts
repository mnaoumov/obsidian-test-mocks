import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor() {
    super();
    const self = strictMock(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceFloating {
    return new WorkspaceFloating();
  }

  public static fromOriginalType4__(value: WorkspaceFloatingOriginal): WorkspaceFloating {
    return castTo<WorkspaceFloating>(value);
  }

  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return castTo<WorkspaceFloatingOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}

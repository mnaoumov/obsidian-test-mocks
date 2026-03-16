import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  protected constructor() {
    super();
    const self = strictProxy(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceFloating {
    return new WorkspaceFloating();
  }

  public static fromOriginalType4__(value: WorkspaceFloatingOriginal): WorkspaceFloating {
    return strictProxy(value, WorkspaceFloating);
  }

  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return strictProxy<WorkspaceFloatingOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}

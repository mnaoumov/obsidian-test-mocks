import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

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
    return bridgeType<WorkspaceFloating>(value);
  }

  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return bridgeType<WorkspaceFloatingOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}

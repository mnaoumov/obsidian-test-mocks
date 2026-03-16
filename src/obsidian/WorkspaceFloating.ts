import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor() {
    super();
    const self = strictProxyForce(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceFloating {
    return new WorkspaceFloating();
  }

  public static fromOriginalType4__(value: WorkspaceFloatingOriginal): WorkspaceFloating {
    return mergePrototype(WorkspaceFloating, value);
  }

  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return strictProxyForce<WorkspaceFloatingOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}

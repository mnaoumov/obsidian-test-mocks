import type { WorkspaceSidedock as WorkspaceSidedockOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

export class WorkspaceSidedock extends WorkspaceSplit {
  public collapsed = false;

  protected constructor(workspace: Workspace, direction: string, _side: string, id?: string) {
    super(workspace, direction, id);
    const self = strictProxy(this);
    self.constructor5__(workspace, direction, _side, id);
    return self;
  }

  public static create3__(workspace: Workspace, direction: string, side: string, id?: string): WorkspaceSidedock {
    return new WorkspaceSidedock(workspace, direction, side, id);
  }

  public static fromOriginalType5__(value: WorkspaceSidedockOriginal): WorkspaceSidedock {
    return strictProxy(value, WorkspaceSidedock);
  }

  public asOriginalType5__(): WorkspaceSidedockOriginal {
    return strictProxy<WorkspaceSidedockOriginal>(this);
  }

  public collapse(): void {
    this.collapsed = true;
  }

  public constructor5__(_workspace: Workspace, _direction: string, _side: string, _id?: string): void {
    noop();
  }

  public expand(): void {
    this.collapsed = false;
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}

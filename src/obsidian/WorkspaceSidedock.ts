import { castTo } from '../internal/Cast.ts';
import type { WorkspaceSidedock as RealWorkspaceSidedock } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';

export class WorkspaceSidedock {
  public collapsed = false;

  protected constructor(_workspace: Workspace, _direction: string, _side: string, _id?: string) {
    const mock = strictMock(this);
    WorkspaceSidedock.constructor__(mock, _workspace, _direction, _side, _id);
    return mock;
  }

  public static constructor__(_instance: WorkspaceSidedock, _workspace: Workspace, _direction: string, _side: string, _id?: string): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _direction: string, _side: string, _id?: string): WorkspaceSidedock {
    return new WorkspaceSidedock(_workspace, _direction, _side, _id);
  }

  public asReal__(): RealWorkspaceSidedock {
    return castTo<RealWorkspaceSidedock>(this);
  }

  public collapse(): void {
    this.collapsed = true;
  }

  public expand(): void {
    this.collapsed = false;
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}

import type { WorkspaceSidedock as WorkspaceSidedockOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

export class WorkspaceSidedock extends WorkspaceSplit {
  public collapsed = false;

  protected constructor(_workspace: Workspace, _direction: string, _side: string, _id?: string) {
    super(_workspace, _direction, _id);
  }

  public static override create__(_workspace: Workspace, _direction: string, _side: string, _id?: string): WorkspaceSidedock {
    return strictMock(new WorkspaceSidedock(_workspace, _direction, _side, _id));
  }

  public override asOriginalType__(): WorkspaceSidedockOriginal {
    return castTo<WorkspaceSidedockOriginal>(this);
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

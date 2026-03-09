import type { WorkspaceSidedock as WorkspaceSidedockOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

export class WorkspaceSidedock extends WorkspaceSplit {
  public collapsed = false;

  protected constructor(workspace: Workspace, direction: string, _side: string, id?: string) {
    super(workspace, direction, id);
  }

  public static override create__(workspace: Workspace, direction: string, side: string, id?: string): WorkspaceSidedock {
    return strictMock(new WorkspaceSidedock(workspace, direction, side, id));
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

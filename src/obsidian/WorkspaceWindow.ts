import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';

export class WorkspaceWindow extends WorkspaceContainer {
  public override get doc(): Document {
    return document;
  }

  public override get win(): Window {
    return window;
  }

  protected constructor(_workspace: Workspace, _id?: string, _size?: Record<string, number>) {
    super(_workspace, '', _id);
    WorkspaceWindow.constructor4__(this, _workspace, _id, _size);
  }

  public static constructor4__(_instance: WorkspaceWindow, _workspace: Workspace, _id?: string, _size?: Record<string, number>): void {
    // Spy hook.
  }

  public static create2__(_workspace: Workspace, _id?: string, _size?: Record<string, number>): WorkspaceWindow {
    return new WorkspaceWindow(_workspace, _id, _size);
  }

  public override asOriginalType__(): WorkspaceWindowOriginal {
    return castTo<WorkspaceWindowOriginal>(this);
  }
}

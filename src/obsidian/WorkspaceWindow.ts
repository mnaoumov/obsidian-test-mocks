import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceWindow {
  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }

  protected constructor(_workspace: Workspace, _id?: string, _size?: Record<string, number>) {
    const mock = strictMock(this);
    WorkspaceWindow.constructor__(mock, _workspace, _id, _size);
    return mock;
  }

  public static constructor__(_instance: WorkspaceWindow, _workspace: Workspace, _id?: string, _size?: Record<string, number>): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _id?: string, _size?: Record<string, number>): WorkspaceWindow {
    return new WorkspaceWindow(_workspace, _id, _size);
  }

  public asOriginalType__(): WorkspaceWindowOriginal {
    return castTo<WorkspaceWindowOriginal>(this);
  }
}

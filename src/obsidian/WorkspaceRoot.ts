import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRoot {
  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    const mock = strictMock(this);
    WorkspaceRoot.constructor__(mock, _workspace, _direction, _id);
    return mock;
  }

  public static constructor__(_instance: WorkspaceRoot, _workspace: Workspace, _direction: string, _id?: string): void {
    // Spy hook.
  }

  public static create__(_workspace: Workspace, _direction: string, _id?: string): WorkspaceRoot {
    return new WorkspaceRoot(_workspace, _direction, _id);
  }

  public asOriginalType__(): WorkspaceRootOriginal {
    return castTo<WorkspaceRootOriginal>(this);
  }
}

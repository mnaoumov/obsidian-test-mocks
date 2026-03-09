import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';

export class WorkspaceRoot extends WorkspaceContainer {
  public override get doc(): Document {
    return document;
  }

  public override get win(): Window {
    return window;
  }

  protected constructor(_workspace: Workspace, _direction: string, _id?: string) {
    super(_workspace, _direction, _id);
    WorkspaceRoot.constructor__(this, _workspace, _direction, _id);
  }

  public static override constructor__(_instance: WorkspaceRoot, _workspace: Workspace, _direction: string, _id?: string): void {
    // Spy hook.
  }

  public static override create__(_workspace: Workspace, _direction: string, _id?: string): WorkspaceRoot {
    return new WorkspaceRoot(_workspace, _direction, _id);
  }

  public override asOriginalType__(): WorkspaceRootOriginal {
    return castTo<WorkspaceRootOriginal>(this);
  }
}

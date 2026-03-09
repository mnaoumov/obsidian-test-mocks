import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
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
  }

  public static override create__(_workspace: Workspace, _direction: string, _id?: string): WorkspaceRoot {
    return strictMock(new WorkspaceRoot(_workspace, _direction, _id));
  }

  public override asOriginalType__(): WorkspaceRootOriginal {
    return castTo<WorkspaceRootOriginal>(this);
  }
}

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

  protected constructor(workspace: Workspace, direction: string, id?: string) {
    super(workspace, direction, id);
  }

  public static override create__(workspace: Workspace, direction: string, id?: string): WorkspaceRoot {
    return strictMock(new WorkspaceRoot(workspace, direction, id));
  }

  public override asOriginalType__(): WorkspaceRootOriginal {
    return castTo<WorkspaceRootOriginal>(this);
  }
}

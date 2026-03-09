import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceContainer } from './WorkspaceContainer.ts';

export class WorkspaceWindow extends WorkspaceContainer {
  public override get doc(): Document {
    return document;
  }

  public override get win(): Window {
    return window;
  }

  protected constructor(workspace: Workspace, id?: string, _size?: Record<string, number>) {
    super(workspace, '', id);
  }

  public static create2__(workspace: Workspace, id?: string, size?: Record<string, number>): WorkspaceWindow {
    return strictMock(new WorkspaceWindow(workspace, id, size));
  }

  public override asOriginalType__(): WorkspaceWindowOriginal {
    return castTo<WorkspaceWindowOriginal>(this);
  }
}

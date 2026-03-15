import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
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
    const self = strictMock(this);
    self.constructor6__(workspace, direction, id);
    return self;
  }

  public static create3__(workspace: Workspace, direction: string, id?: string): WorkspaceRoot {
    return new WorkspaceRoot(workspace, direction, id);
  }

  public static override fromOriginalType__(value: WorkspaceRootOriginal): WorkspaceRoot {
    return castTo<WorkspaceRoot>(value);
  }

  public override asOriginalType__(): WorkspaceRootOriginal {
    return castTo<WorkspaceRootOriginal>(this);
  }

  public constructor6__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

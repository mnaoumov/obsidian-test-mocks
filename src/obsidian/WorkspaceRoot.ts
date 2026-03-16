import type { WorkspaceRoot as WorkspaceRootOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
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
    const self = strictProxy(this);
    self.constructor6__(workspace, direction, id);
    return self;
  }

  public static create3__(workspace: Workspace, direction: string, id?: string): WorkspaceRoot {
    return new WorkspaceRoot(workspace, direction, id);
  }

  public static fromOriginalType6__(value: WorkspaceRootOriginal): WorkspaceRoot {
    return strictProxy(value, WorkspaceRoot);
  }

  public asOriginalType6__(): WorkspaceRootOriginal {
    return strictProxy<WorkspaceRootOriginal>(this);
  }

  public constructor6__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

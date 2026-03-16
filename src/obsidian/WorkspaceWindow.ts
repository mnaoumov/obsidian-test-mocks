import type { WorkspaceWindow as WorkspaceWindowOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
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
    const self = strictProxy(this);
    self.constructor6__(workspace, id, _size);
    return self;
  }

  public static create3__(workspace: Workspace, id?: string, size?: Record<string, number>): WorkspaceWindow {
    return new WorkspaceWindow(workspace, id, size);
  }

  public static fromOriginalType6__(value: WorkspaceWindowOriginal): WorkspaceWindow {
    return bridgeType<WorkspaceWindow>(value);
  }

  public asOriginalType6__(): WorkspaceWindowOriginal {
    return bridgeType<WorkspaceWindowOriginal>(this);
  }

  public constructor6__(_workspace: Workspace, _id?: string, _size?: Record<string, number>): void {
    noop();
  }
}

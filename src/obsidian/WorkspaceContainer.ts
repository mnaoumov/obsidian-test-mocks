import type { WorkspaceContainer as WorkspaceContainerOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

export abstract class WorkspaceContainer extends WorkspaceSplit {
  public abstract doc: Document;
  public abstract win: Window;

  protected constructor(workspace: Workspace, direction: string, id?: string) {
    super(workspace, direction, id);
    const self = strictProxy(this);
    self.constructor5__(workspace, direction, id);
    return self;
  }

  public static fromOriginalType5__(value: WorkspaceContainerOriginal): WorkspaceContainer {
    return strictProxy(value, WorkspaceContainer);
  }

  public asOriginalType5__(): WorkspaceContainerOriginal {
    return strictProxy<WorkspaceContainerOriginal>(this);
  }

  public constructor5__(_workspace: Workspace, _direction: string, _id?: string): void {
    noop();
  }
}

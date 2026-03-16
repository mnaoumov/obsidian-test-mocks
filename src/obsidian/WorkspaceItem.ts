import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal,
  WorkspaceParent as WorkspaceParentOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  declare public parent: WorkspaceParentOriginal;

  protected constructor(workspace?: Workspace, id?: string) {
    super();
    const self = strictProxy(this);
    self.constructor2__(workspace, id);
    return self;
  }

  public static fromOriginalType2__(value: WorkspaceItemOriginal): WorkspaceItem {
    return strictProxy(value, WorkspaceItem);
  }

  public asOriginalType2__(): WorkspaceItemOriginal {
    return strictProxy<WorkspaceItemOriginal>(this);
  }

  public constructor2__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  public getContainer(): WorkspaceContainerOriginal {
    return strictProxy<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

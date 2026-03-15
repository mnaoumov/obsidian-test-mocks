import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor(workspace?: Workspace, id?: string) {
    super();
    const self = strictMock(this);
    self.constructor2__(workspace, id);
    return self;
  }

  public static override fromOriginalType__(value: WorkspaceItemOriginal): WorkspaceItem {
    return castTo<WorkspaceItem>(value);
  }

  public override asOriginalType__(): WorkspaceItemOriginal {
    return castTo<WorkspaceItemOriginal>(this);
  }

  public constructor2__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  public getContainer(): WorkspaceContainerOriginal {
    return castTo<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

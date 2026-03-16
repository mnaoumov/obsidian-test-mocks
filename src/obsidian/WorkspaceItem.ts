import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor(workspace?: Workspace, id?: string) {
    super();
    const self = createMockOfUnsafe(this);
    self.constructor2__(workspace, id);
    return self;
  }

  public static fromOriginalType2__(value: WorkspaceItemOriginal): WorkspaceItem {
    return createMockOfUnsafe<WorkspaceItem>(value);
  }

  public asOriginalType2__(): WorkspaceItemOriginal {
    return createMockOfUnsafe<WorkspaceItemOriginal>(this);
  }

  public constructor2__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  public getContainer(): WorkspaceContainerOriginal {
    return createMockOfUnsafe<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

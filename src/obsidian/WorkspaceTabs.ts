import type { WorkspaceTabs as WorkspaceTabsOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';
import type { WorkspaceSplit } from './WorkspaceSplit.ts';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceTabs extends WorkspaceParent {
  declare public parent: WorkspaceSplit;

  protected constructor(_workspace: Workspace, _id?: string) {
    super(_workspace, _id);
    const self = createMockOf(this);
    self.constructor4__(_workspace, _id);
    return self;
  }

  public static create2__(workspace: Workspace, id?: string): WorkspaceTabs {
    return new WorkspaceTabs(workspace, id);
  }

  public static fromOriginalType4__(value: WorkspaceTabsOriginal): WorkspaceTabs {
    return createMockOfUnsafe<WorkspaceTabs>(value);
  }

  public asOriginalType4__(): WorkspaceTabsOriginal {
    return createMockOfUnsafe<WorkspaceTabsOriginal>(this);
  }

  public constructor4__(_workspace: Workspace, _id?: string): void {
    noop();
  }
}

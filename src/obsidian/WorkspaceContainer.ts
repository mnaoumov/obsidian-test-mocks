import type { WorkspaceContainer as WorkspaceContainerOriginal } from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { castTo } from '../internal/Cast.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

export abstract class WorkspaceContainer extends WorkspaceSplit {
  public abstract doc: Document;
  public abstract win: Window;

  protected constructor(workspace: Workspace, direction: string, id?: string) {
    super(workspace, direction, id);
  }

  public override asOriginalType__(): WorkspaceContainerOriginal {
    return castTo<WorkspaceContainerOriginal>(this);
  }
}

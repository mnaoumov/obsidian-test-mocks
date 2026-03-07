import type { WorkspaceContainer } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor() {
    super();
    WorkspaceItem.__constructor(this);
  }

  public static override __constructor(_instance: WorkspaceItem, ..._args: unknown[]): void {
    // Spy hook.
  }

  public getContainer(): WorkspaceContainer {
    return castTo<WorkspaceContainer>(this);
  }

  public getRoot(): WorkspaceItem {
    return this;
  }
}

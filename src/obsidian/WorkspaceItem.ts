import type { WorkspaceContainer } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  public getContainer(): WorkspaceContainer {
    return castTo<WorkspaceContainer>(this);
  }

  public getRoot(): WorkspaceItem {
    return this;
  }
}

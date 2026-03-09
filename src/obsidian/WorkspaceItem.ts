import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor() {
    super();
  }

  public override asOriginalType__(): WorkspaceItemOriginal {
    return castTo<WorkspaceItemOriginal>(this);
  }

  public getContainer(): WorkspaceContainerOriginal {
    return castTo<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

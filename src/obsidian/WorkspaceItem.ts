import type {
  WorkspaceContainer,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor() {
    super();
  }

  public override asOriginalType__(): WorkspaceItemOriginal {
    return castTo<WorkspaceItemOriginal>(this);
  }

  public getContainer(): WorkspaceContainer {
    return castTo<WorkspaceContainer>(this);
  }

  public getRoot(): this {
    return this;
  }
}

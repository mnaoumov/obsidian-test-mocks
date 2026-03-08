import type {
  WorkspaceContainer,
  WorkspaceItem as RealWorkspaceItem
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import {
  strictMock
} from '../internal/StrictMock.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceItem.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceItem, ..._args: unknown[]): void {
    // Spy hook.
  }

  public getContainer(): WorkspaceContainer {
    return castTo<WorkspaceContainer>(this);
  }

  public getRoot(): WorkspaceItem {
    return this;
  }

  public override asReal__(): RealWorkspaceItem {
    return castTo<RealWorkspaceItem>(this);
  }
}

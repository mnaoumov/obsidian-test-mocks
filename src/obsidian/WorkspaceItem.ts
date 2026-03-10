import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor() {
    super();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public override asOriginalType__(): WorkspaceItemOriginal {
    return castTo<WorkspaceItemOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }

  public getContainer(): WorkspaceContainerOriginal {
    return castTo<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

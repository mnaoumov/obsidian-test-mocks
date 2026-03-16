import type {
  WorkspaceContainer as WorkspaceContainerOriginal,
  WorkspaceItem as WorkspaceItemOriginal
} from 'obsidian';

import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';

export abstract class WorkspaceItem extends Events {
  protected constructor(workspace?: Workspace, id?: string) {
    super();
    const self = strictProxy(this);
    self.constructor2__(workspace, id);
    return self;
  }

  public static fromOriginalType2__(value: WorkspaceItemOriginal): WorkspaceItem {
    return bridgeType<WorkspaceItem>(value);
  }

  public asOriginalType2__(): WorkspaceItemOriginal {
    return bridgeType<WorkspaceItemOriginal>(this);
  }

  public constructor2__(_workspace?: Workspace, _id?: string): void {
    noop();
  }

  public getContainer(): WorkspaceContainerOriginal {
    return bridgeType<WorkspaceContainerOriginal>(this);
  }

  public getRoot(): this {
    return this;
  }
}

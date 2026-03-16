import type { WorkspaceFloating as WorkspaceFloatingOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceFloating extends WorkspaceParent {
  declare public parent: WorkspaceParent;

  protected constructor() {
    super();
    const self = createMockOf(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceFloating {
    return new WorkspaceFloating();
  }

  public static fromOriginalType4__(value: WorkspaceFloatingOriginal): WorkspaceFloating {
    return createMockOfUnsafe<WorkspaceFloating>(value);
  }

  public asOriginalType4__(): WorkspaceFloatingOriginal {
    return createMockOfUnsafe<WorkspaceFloatingOriginal>(this);
  }

  public constructor4__(): void {
    noop();
  }
}
